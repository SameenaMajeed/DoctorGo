// src/store/slices/notificationSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { io, Socket } from "socket.io-client";

interface Notification {
  _id: string;
  userId: string;
  userType: "user" | "doctor";
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEntity?: { type: string; id: string };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

let socket: Socket | null = null;

export const initializeSocket = createAsyncThunk(
  "notifications/initializeSocket",
  async (_, { dispatch }) => {
    socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") || "" },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("newNotification", (notification: Notification) => {
      dispatch(addNotification(notification));
    });

    socket.on("notificationRead", (notificationId: string) => {
      dispatch(markNotificationAsRead(notificationId));
    });

    return socket.id;
  }
);

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userType: "user" | "doctor", { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/${userType}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.notifications;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const userType = localStorage.getItem("userType") || "user";
      await axios.patch(
        `/api/${userType}s/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (socket) {
        socket.emit("markNotificationAsRead", notificationId);
      }
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark notification as read");
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (userType: "user" | "doctor", { rejectWithValue }) => {
    try {
      await axios.patch(
        `/api/${userType}s/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all notifications as read");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },
    markNotificationAsRead(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.map((n) =>
        n._id === action.payload ? { ...n, isRead: true } : n
      );
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<string>) => {
        state.notifications = state.notifications.map((n) =>
          n._id === action.payload ? { ...n, isRead: true } : n
        );
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, markNotificationAsRead: markNotificationAsReadAction } = notificationSlice.actions;
export default notificationSlice.reducer;