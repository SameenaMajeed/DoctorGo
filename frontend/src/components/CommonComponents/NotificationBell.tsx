"use client"

import { useEffect, useState, useRef } from "react"
import { Bell, Check, X, CheckCheck, Trash2 } from "lucide-react"
import { io } from "socket.io-client"
import { format, formatDistanceToNow } from "date-fns"
// import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../slice/Store/Store"
import api from "../../axios/UserInstance"
import doctorApi from "../../axios/DoctorInstance"
import Loader from "../Admin/Loader"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  _id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  timestamp?: string
  link?: string
  type?: "info" | "success" | "warning" | "error"
  priority?: "low" | "medium" | "high"
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("unread")
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  // const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.user.user)
  const doctor = useSelector((state: RootState) => state.doctor.doctor)
  const isDoctorRoute = window.location.pathname.includes("/doctor")
  const userRole = isDoctorRoute ? "doctor" : "user"
  const accessToken = isDoctorRoute ? doctor?.accessToken : user?.accessToken
  const userId = isDoctorRoute ? doctor?._id : user?.id
  const baseApi = isDoctorRoute ? doctorApi : api
  const socket = useRef<any>(null)

  const fetchNotifications = async () => {
    console.log("Fetching notifications...")
    setIsLoading(true)
    try {
      const response = await baseApi.get(`/notifications`, {
        params: {
          recipientId: userId,
          recipientType: userRole,
        },
      })

      const notifications = response.data.data?.notifications || response.data.notifications || []
      console.log(notifications)
      const unread = notifications.filter((n: any) => !n.read).length

      setNotifications(notifications)
      setUnreadCount(unread)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!userId || !accessToken) return

    fetchNotifications()

    // Initialize socket connection
    socket.current = io(import.meta.env.VITE_Base_Url, {
      auth: { token: accessToken, role: userRole },
      query: { isDoctor: isDoctorRoute },
    })

    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current.id)
    })

    socket.current.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err)
    })

    socket.current.on("receiveNotification", (data: any) => {
      console.log("Notification received:", data)
      setNotifications((prev) => [data, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    socket.current.on("newNotification", (notification: any) => {
      console.log("NewNotification received:", notification)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      socket.current?.off("receiveNotification")
      socket.current?.off("newNotification")
      socket.current?.disconnect()
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userId, accessToken, userRole])

  const markAsRead = async (notificationId: string) => {
    setLoadingIds((prev) => [...prev, notificationId])
    try {
      await baseApi.patch(`/notifications/${notificationId}/read`)
      await fetchNotifications()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  const markAllAsRead = async () => {
    setIsMarkingAllRead(true)
    try {
      await baseApi.patch(`/notifications/mark-all-read`, {
        recipientId: userId,
        recipientType: userRole,
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    setLoadingIds((prev) => [...prev, notificationId])
    try {
      await baseApi.delete(`/notifications/${notificationId}`)
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
      setUnreadCount((prev) => {
        const notification = notifications.find((n) => n._id === notificationId)
        return notification && !notification.read ? prev - 1 : prev
      })
    } catch (error) {
      console.error("Failed to delete notification:", error)
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== notificationId))
    }
  }

  // const handleNotificationClick = (notif: Notification) => {
  //   if (!notif.read) {
  //     markAsRead(notif._id)
  //   }
  //   if (notif.link) navigate(notif.link)
  // }

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev)
  }

  const getNotificationTime = (notif: Notification) => {
    const timestamp = notif.createdAt || notif.timestamp
    if (!timestamp) return "Just now"
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true })
      } else {
        return format(date, "MMM dd, yyyy")
      }
    } catch {
      return "Just now"
    }
  }

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "warning":
        return "⚠️"
      case "error":
        return "❌"
      default:
        return "📢"
    }
  }

  const getNotificationColor = (type?: string, priority?: string) => {
    if (priority === "high") return "border-l-red-500"
    switch (type) {
      case "success":
        return "border-l-green-500"
      case "warning":
        return "border-l-yellow-500"
      case "error":
        return "border-l-red-500"
      default:
        return "border-l-blue-500"
    }
  }

  console.log("All notifications:", notifications)

  const filteredNotifications = notifications.filter((notif) => {
    switch (filter) {
      case "unread":
        return !notif.read
      case "read":
        return notif.read
      default:
        return true
    }
  })

  console.log("Filtered notifications:", filteredNotifications)


  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer"
        onClick={toggleDropdown}
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors duration-200" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-lg"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <p className="text-sm opacity-90">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllAsRead}
                      disabled={isMarkingAllRead}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      title="Mark all as read"
                    >
                      {isMarkingAllRead ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCheck className="w-4 h-4" />
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDropdown(false)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              {(["all", "unread", "read"] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                    filter === filterType
                      ? "text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-gray-800"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  {filterType}
                  {filterType === "unread" && unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notif, index) => (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-l-4 ${getNotificationColor(notif.type, notif.priority)} ${
                        !notif.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">{getNotificationIcon(notif.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4
                                className={`font-medium text-sm ${!notif.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                              >
                                {notif.title || "Notification"}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {getNotificationTime(notif)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}

                              {loadingIds.includes(notif._id) ? (
                                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <div className="flex gap-1">
                                  {!notif.read && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => markAsRead(notif._id)}
                                      className="p-1 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                      title="Mark as read"
                                    >
                                      <Check className="w-4 h-4" />
                                    </motion.button>
                                  )}

                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteNotification(notif._id)}
                                    className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete notification"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* {notif.link && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleNotificationClick(notif)}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Details →
                            </motion.button>
                          )} */}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {/* {filteredNotifications.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/notifications")}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  View All Notifications
                </motion.button>
              </div>
            )} */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell



// import { useEffect, useState, useRef } from "react";
// import { Bell, Check } from "lucide-react";
// import { io } from "socket.io-client";
// import { format } from "date-fns";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import api from "../../axios/UserInstance";
// import doctorApi from "../../axios/DoctorInstance";
// import Loader from "../Admin/Loader";

// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loadingIds, setLoadingIds] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();

//   const user = useSelector((state: RootState) => state.user.user);
//   const doctor = useSelector((state: RootState) => state.doctor.doctor);

//   const isDoctorRoute = window.location.pathname.includes("/doctor");
//   const userRole = isDoctorRoute ? "doctor" : "user";
//   const accessToken = isDoctorRoute ? doctor?.accessToken : user?.accessToken;
//   const userId = isDoctorRoute ? doctor?._id : user?.id;

//   const baseApi = isDoctorRoute ? doctorApi : api;

//   const socket = useRef<any>(null);

//   const fetchNotifications = async () => {
//     console.log("Fetching notifications...");
//     setIsLoading(true);
//     try {
//       const response = await baseApi.get(`/notifications`, {
//         params: {
//           recipientId: userId,
//           recipientType: userRole,
//         },
//       });

//       // const data = response.data.data;
//       // // Verify the exact response structure
//       const notifications =
//         response.data.data?.notifications || response.data.notifications || [];
//       const unread = notifications.filter((n: any) => !n.read).length;

//       console.log("Processed data:", { notifications, unread }); // Debug log
//       setNotifications(notifications);
//       setUnreadCount(notifications.filter((n: any) => !n.read).length);
//     } catch (error) {
//       console.error("Failed to fetch notifications:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!userId || !accessToken) return;

//     fetchNotifications();

//     // Initialize socket connection
//     socket.current = io(
//       import.meta.env.VITE_Base_Url || "http://localhost:5000",
//       {
//         auth: { token: accessToken, role: userRole },
//         query: { isDoctor: isDoctorRoute },
//       }
//     );

//     socket.current.on("connect", () => {
//       console.log("Socket connected:", socket.current.id);
//     });

//     socket.current.on("connect_error", (err: any) => {
//       console.error("Socket connection error:", err);
//     });

//     socket.current.on("receiveNotification", (data: any) => {
//       console.log("Notification received:", data);
//       setNotifications((prev) => [data, ...prev]);
//       setUnreadCount((prev) => prev + 1);
//     });

//     socket.current.on("newNotification", (notification: any) => {
//       console.log("NewNotification received:", notification);
//       setNotifications((prev) => [notification, ...prev]);
//       setUnreadCount((prev) => prev + 1);
//     });

//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       socket.current?.off("receiveNotification");
//       socket.current?.off("newNotification");
//       socket.current?.disconnect();
//       document.removeEventListener("mousedown", handleClickOutside);
//       // socket.current?.disconnect();
//       // document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [userId, accessToken, userRole]);

//   const markAsRead = async (notificationId: string) => {
//     setLoadingIds((prev) => [...prev, notificationId]);
//     try {
//       await baseApi.patch(`/notifications/${notificationId}/read`);

//       await fetchNotifications();

//       // setNotifications((prev) =>
//       //   prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
//       // );

//       // // Update unread count based on current notifications
//       // setUnreadCount((prev) => prev - 1);
//     } catch (error) {
//       console.error("Failed to mark notification as read:", error);
//     } finally {
//       setLoadingIds((prev) => prev.filter((id) => id !== notificationId));
//     }
//   };

//   const handleNotificationClick = (notif: any) => {
//     if (!notif.read) {
//       markAsRead(notif._id);
//     }
//     if (notif.link) navigate(notif.link);
//   };

//   //   const markAllAsRead = async () => {
//   //   try {
//   //     await baseApi.patch(`/notifications/mark-all-read`, {
//   //       recipientId: userId,
//   //       recipientType: userRole
//   //     });

//   //     setNotifications(prev =>
//   //       prev.map(n => ({ ...n, read: true }))
//   //     );

//   //     setUnreadCount(0);
//   //   } catch (error) {
//   //     console.error("Failed to mark all as read:", error);
//   //   }
//   // };

//   const toggleDropdown = () => {
//     setShowDropdown((prev) => !prev);
//     // setUnreadCount(0);
//   };

//   const getNotificationTime = (notif: any) => {
//     const timestamp = notif.createdAt || notif.timestamp;
//     if (!timestamp) return "Just now";

//     try {
//       return format(new Date(timestamp), "dd MMM yyyy, hh:mm a");
//     } catch {
//       return "Just now";
//     }
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <Bell
//         onClick={toggleDropdown}
//         className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-500 transition"
//       />
//       {unreadCount > 0 && (
//         <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pingOnce">
//           {unreadCount}
//         </span>
//       )}

//       {showDropdown && (
//         <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-lg rounded-xl p-4 z-50 border border-gray-300 dark:border-zinc-700">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Notifications</h2>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowDropdown(false)}
//                 className="text-gray-500 hover:text-red-500 transition"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>

//           <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
//             {isLoading ? (
//               <div className="flex justify-center py-4">
//                 <Loader />
//               </div>
//             ) : notifications.length === 0 ? (
//               <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
//                 🎉 You're all caught up!
//               </p>
//             ) : (
//               notifications.map((notif, index) => (
//                 <div
//                   key={index}
//                   className={`flex justify-between items-start gap-2 p-3 rounded-md transition ${
//                     notif.read
//                       ? "bg-zinc-800/60"
//                       : "bg-zinc-700 hover:bg-zinc-600"
//                   }`}
//                 >
//                   <div>
//                     <p className="font-medium text-base">
//                       {notif.title || "Notification"}
//                     </p>
//                     <p className="text-sm text-gray-300 mt-1">
//                       {notif.message}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-1">
//                       {getNotificationTime(notif)}
//                     </p>
//                   </div>
//                   {loadingIds.includes(notif._id) ? (
//                     <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin mt-1" />
//                   ) : (
//                     <Check
//                       onClick={() => handleNotificationClick(notif)}
//                       className="w-5 h-5 text-green-400 hover:text-green-600 cursor-pointer mt-1"
//                     />
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;
