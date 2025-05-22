import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VideoCallState {
  status: "idle" | "connecting" | "connected" | "error";
  roomId: string | null;
  bookingId: string | null;
}

const initialState: VideoCallState = {
  status: "idle",
  roomId: null,
  bookingId: null,
};

const videoCallSlice = createSlice({
  name: "videoCall",
  initialState,
  reducers: {
    setVideoCallStatus(state, action: PayloadAction<VideoCallState["status"]>) {
      state.status = action.payload;
    },
    setVideoCallRoom(state, action: PayloadAction<{ roomId: string; bookingId: string }>) {
      state.roomId = action.payload.roomId;
      state.bookingId = action.payload.bookingId;
    },
  },
});

export const { setVideoCallStatus, setVideoCallRoom } = videoCallSlice.actions;
export default videoCallSlice.reducer;