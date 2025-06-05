import { useEffect, useState, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { io } from "socket.io-client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import api from "../../axios/UserInstance";
import doctorApi from "../../axios/DoctorInstance";
import Loader from "../Admin/Loader";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.user);
  const doctor = useSelector((state: RootState) => state.doctor.doctor);

  const isDoctorRoute = window.location.pathname.includes("/doctor");
  const userRole = isDoctorRoute ? "doctor" : "user";
  const accessToken = isDoctorRoute ? doctor?.accessToken : user?.accessToken;
  const userId = isDoctorRoute ? doctor?._id : user?.id;

  const baseApi = isDoctorRoute ? doctorApi : api;

  const socket = useRef<any>(null);

  const fetchNotifications = async () => {
    console.log("Fetching notifications...");
    setIsLoading(true);
    try {
      const response = await baseApi.get(`/notifications`, {
        params: {
          recipientId: userId,
          recipientType: userRole,
        },
      });

      // const data = response.data.data;
      // // Verify the exact response structure
    const notifications = response.data.data?.notifications || response.data.notifications || [];
    const unread = notifications.filter((n: any) => !n.read).length;
    
    console.log("Processed data:", { notifications, unread }); // Debug log
      setNotifications(notifications);
      setUnreadCount(notifications.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }finally {
    setIsLoading(false);
  }
  };

  useEffect(() => {
    if (!userId || !accessToken) return;

    fetchNotifications();

    // Initialize socket connection
    socket.current = io(
      import.meta.env.VITE_Base_Url || "http://localhost:5000",
      {
        auth: { token: accessToken, role: userRole },
        query: { isDoctor: isDoctorRoute },
      }
    );

    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current.id);
    });

    socket.current.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err);
    });

    socket.current.on("receiveNotification", (data: any) => {
      console.log("Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      socket.current?.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userId, accessToken, userRole]);

  const markAsRead = async (notificationId: string) => {
    setLoadingIds((prev) => [...prev, notificationId]);
    try {
      await baseApi.patch(`/notifications/${notificationId}/read`);

      await fetchNotifications();

      // setNotifications((prev) =>
      //   prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      // );

      // // Update unread count based on current notifications
      // setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.read) {
      markAsRead(notif._id);
    }
    if (notif.link) navigate(notif.link);
  };

//   const markAllAsRead = async () => {
//   try {
//     await baseApi.patch(`/notifications/mark-all-read`, {
//       recipientId: userId,
//       recipientType: userRole
//     });
    
//     setNotifications(prev => 
//       prev.map(n => ({ ...n, read: true }))
//     );
    
//     setUnreadCount(0);
//   } catch (error) {
//     console.error("Failed to mark all as read:", error);
//   }
// };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    // setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Bell
        onClick={toggleDropdown}
        className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition"
      />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pingOnce">
          {unreadCount}
        </span>
      )}

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-lg rounded-xl p-4 z-50 border border-gray-300 dark:border-zinc-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader />
        </div>
      ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                🎉 You're all caught up!
              </p>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-start gap-2 p-3 rounded-md transition ${
                    notif.read
                      ? "bg-zinc-800/60"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  <div>
                    <p className="font-medium text-base">
                      {notif.title || "Notification"}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(
                        new Date(notif.timestamp || Date.now()),
                        "dd MMM yyyy, hh:mm a"
                      )}
                    </p>
                  </div>
                  {loadingIds.includes(notif._id) ? (
                    <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin mt-1" />
                  ) : (
                    <Check
                      onClick={() => handleNotificationClick(notif)}
                      className="w-5 h-5 text-green-400 hover:text-green-600 cursor-pointer mt-1"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
