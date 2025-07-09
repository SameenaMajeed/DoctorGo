"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Send,
  ImageIcon,
  Paperclip,
  Loader2,
  Smile,
  Mic,
  CheckCheck,
  Check,
  Circle,
  MessageCircle,
  Users,
  X,
  Plus,
} from "lucide-react"
import { cn } from "../../Utils/Utils"
import io, { type Socket } from "socket.io-client"
import { useSelector } from "react-redux"
import { BaseUrl } from "../../constants"
import type { RootState } from "../../slice/Store/Store"
import doctorApi from "../../axios/DoctorInstance"
import toast from "react-hot-toast"

type IMessage = {
  _id: string
  senderId: string
  senderRole: "user" | "doctor"
  message: string
  timestamp: string | Date
  status?: "sent" | "delivered" | "read"
}

interface IUser {
  id: string
  name: string
  mobile_no?: string
  profilePicture?: string
  lastMessage?: string
  lastMessageTime?: string
  online?: boolean
  unreadCount?: number
  typing?: boolean
}

const SOCKET_URL = BaseUrl

const ChatPage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [input, setInput] = useState("")
  const [users, setUsers] = useState<IUser[]>([])
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastReadTimeRef = useRef<{ [key: string]: Date }>({})
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id)
  const userName = useSelector((state: RootState) => state.doctor.doctor?.name)
  const token = useSelector((state: RootState) => state.doctor.doctor?.accessToken)

  useEffect(() => {
    if (!doctorId || !token) {
      setError("Please log in to access chat")
      return
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const response = await doctorApi.get(`/chats/users/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const fetchedUsers = response.data.data?.users || []
        setUsers(
          fetchedUsers
            .map((user: IUser) => ({
              ...user,
              unreadCount: 0,
            }))
            .sort((a: IUser, b: IUser) => {
              const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
              const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
              return timeB - timeA
            }),
        )
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch users")
        toast.error("Failed to load chat users")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to socket")
      if (selectedUser) {
        newSocket.emit("joinChat", { userId: selectedUser.id, doctorId })
      }
    })

    newSocket.on("previousMessages", (msgs: IMessage[]) => {
      setMessages(msgs)
      if (selectedUser) {
        lastReadTimeRef.current[selectedUser.id] = new Date()
        updateUnreadCount(selectedUser.id, 0)
      }
    })

    newSocket.on("receiveMessage", (msg: IMessage) => {
      setMessages((prev) => [...prev, msg])
      if (selectedUser && msg.senderId !== doctorId) {
        if (
          !lastReadTimeRef.current[selectedUser.id] ||
          new Date(msg.timestamp) > lastReadTimeRef.current[selectedUser.id]
        ) {
          updateUnreadCount(selectedUser.id, (prevCount) => (prevCount || 0) + 1)
        }
      }
    })

    newSocket.on("userTyping", ({ userId, isTyping: typing }) => {
      if (selectedUser?.id === userId) {
        setIsTyping(typing)
      }
    })

    newSocket.on("newNotification", (notification: any) => {
      console.log("New notification received:", notification)
      toast.success("New message received!")
    })

    newSocket.on("error", (err: string) => {
      setError(err)
      toast.error(err)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [doctorId, token, selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleTyping = (value: string) => {
    setInput(value)

    if (socket && selectedUser) {
      socket.emit("typing", { userId: selectedUser.id, doctorId, isTyping: value.length > 0 })

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { userId: selectedUser.id, doctorId, isTyping: false })
      }, 1000)
    }
  }

  const sendMessage = () => {
    if (!input.trim() || !selectedUser || !socket) return

    const messageData = {
      userId: selectedUser.id,
      doctorId,
      message: input.trim(),
    }

    socket.emit("sendMessage", messageData)
    socket.emit("message", {
      userId: selectedUser.id,
      doctorId,
      message: input,
      senderName: userName,
    })

    setInput("")
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    socket.emit("typing", { userId: selectedUser.id, doctorId, isTyping: false })
  }

  const updateUnreadCount = (userId: string, count: number | ((prevCount: number) => number)) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              unreadCount: typeof count === "function" ? count(user.unreadCount || 0) : count,
            }
          : user,
      ),
    )
  }

  const handleUserSelect = (user: IUser) => {
    setSelectedUser(user)
    socket?.emit("joinChat", { userId: user.id, doctorId })
    lastReadTimeRef.current[user.id] = new Date()
    updateUnreadCount(user.id, 0)
    setMessages([])
  }

  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getMessageStatus = (message: IMessage) => {
    if (message.senderRole === "doctor") {
      switch (message.status) {
        case "read":
          return <CheckCheck className="w-4 h-4 text-blue-500" />
        case "delivered":
          return <CheckCheck className="w-4 h-4 text-gray-400" />
        default:
          return <Check className="w-4 h-4 text-gray-400" />
      }
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative z-10 flex h-screen">
        {/* Enhanced Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={cn(
            "bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl transition-all duration-300",
            sidebarCollapsed ? "w-20" : "w-80",
          )}
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Messages
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Connect with your patients</p>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? <Plus className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>

            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Loading chats...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No conversations yet</p>
                <p className="text-gray-400 text-sm mt-1">Start chatting with your patients</p>
              </div>
            ) : (
              <div className="p-3">
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleUserSelect(user)}
                      className={cn(
                        "flex items-center p-3 cursor-pointer rounded-xl transition-all duration-200 mb-2 group",
                        selectedUser?.id === user.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm"
                          : "hover:bg-gray-50",
                      )}
                    >
                      {sidebarCollapsed ? (
                        <div className="relative">
                          <img
                            src={user.profilePicture || "/profile.png"}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {user.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                          )}
                          {user.unreadCount && user.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-medium">{user.unreadCount}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <img
                              src={user.profilePicture || "/profile.png"}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                            {user.online && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          <div className="flex-1 ml-3 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {user.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {user.lastMessageTime ? formatTime(user.lastMessageTime) : ""}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-600 truncate">{user.lastMessage || "No messages yet"}</p>
                              {user.unreadCount && user.unreadCount > 0 ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                                  {user.unreadCount}
                                </span>
                              ) : ''}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
          {selectedUser ? (
            <>
              {/* Enhanced Chat Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={selectedUser.profilePicture || "/profile.png"}
                        alt={selectedUser.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg"
                      />
                      {selectedUser.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h2 className="font-bold text-gray-900 text-lg">{selectedUser.name}</h2>
                      <div className="flex items-center gap-2">
                        {selectedUser.online ? (
                          <div className="flex items-center gap-1">
                            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Online</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Last seen recently</span>
                        )}
                        {isTyping && (
                          <div className="flex items-center gap-1">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100" />
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200" />
                            </div>
                            <span className="text-sm text-blue-600">typing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>

              {/* Enhanced Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn("flex", msg.senderRole === "doctor" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm",
                          msg.senderRole === "doctor"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md border border-gray-200",
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <span
                            className={cn("text-xs", msg.senderRole === "doctor" ? "text-blue-100" : "text-gray-500")}
                          >
                            {formatTime(msg.timestamp)}
                          </span>
                          {getMessageStatus(msg)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm border-t border-white/20 p-6"
              >
                <div className="flex items-center gap-3">
                  <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => handleTyping(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-full px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={isRecording ? () => setIsRecording(false) : () => setIsRecording(true)}
                    className={cn(
                      "p-3 rounded-full transition-colors",
                      isRecording
                        ? "text-red-600 bg-red-50 hover:bg-red-100"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50",
                    )}
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className={cn(
                      "p-3 rounded-full transition-all duration-200",
                      input.trim()
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed",
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Messages</h3>
                <p className="text-gray-600 max-w-md">
                  Select a patient from the sidebar to start a conversation and provide better care through direct
                  communication.
                </p>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ChatPage


// import React, { useState, useEffect, useRef } from "react";
// import {
//   FaSearch,
//   FaPaperPlane,
//   FaImage,
//   FaPaperclip,
//   FaSpinner,
//   // FaVideo,
// } from "react-icons/fa";
// import { cn } from "../../Utils/Utils";
// import io, { Socket } from "socket.io-client";
// import { useSelector } from "react-redux";
// import { BaseUrl } from "../../constants";
// import { RootState } from "../../slice/Store/Store";
// import doctorApi from "../../axios/DoctorInstance";

// type IMessage = {
//   _id: string;
//   senderId: string;
//   senderRole: "user" | "doctor";
//   message: string;
//   timestamp: string | Date;
// };

// interface IUser {
//   id: string;
//   name: string;
//   mobile_no?: string;
//   profilePicture?: string;
//   lastMessage?: string;
//   lastMessageTime?: string;
//   online?: boolean;
//   unreadCount?: number;
// }

// const SOCKET_URL = BaseUrl;

// const ChatPage: React.FC = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [users, setUsers] = useState<IUser[]>([]);
//   const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const lastReadTimeRef = useRef<{ [key: string]: Date }>({});

//   const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);
//   const userName = useSelector((state: RootState) => state.doctor.doctor?.name);
//   const token = useSelector(
//     (state: RootState) => state.doctor.doctor?.accessToken
//   );

//   useEffect(() => {
//     if (!doctorId || !token) {
//       setError("Please log in to access chat");
//       return;
//     }

//     const fetchUsers = async () => {
//       try {
//         setIsLoading(true);
//         const response = await doctorApi.get(`/chats/users/${doctorId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const fetchedUsers = response.data.data?.users || [];
//         setUsers(
//           fetchedUsers
//             .map((user: IUser) => ({
//               ...user,
//               unreadCount: 0,
//             }))
//             .sort((a: IUser, b: IUser) => {
//               const timeA = a.lastMessageTime
//                 ? new Date(a.lastMessageTime).getTime()
//                 : 0;
//               const timeB = b.lastMessageTime
//                 ? new Date(b.lastMessageTime).getTime()
//                 : 0;
//               return timeB - timeA;
//             })
//         );
//         setError(null);
//       } catch (err: any) {
//         setError(err.response?.data?.message || "Failed to fetch users");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUsers();

//     const newSocket = io(SOCKET_URL, {
//       auth: { token },
//       reconnection: true,
//       reconnectionAttempts: 5,
//     });

//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("Connected to socket");
//       if (selectedUser) {
//         newSocket.emit("joinChat", { userId: selectedUser.id, doctorId });
//       }
//     });

//     newSocket.on("previousMessages", (msgs: IMessage[]) => {
//       setMessages(msgs);
//       if (selectedUser) {
//         lastReadTimeRef.current[selectedUser.id] = new Date();
//         updateUnreadCount(selectedUser.id, 0);
//       }
//     });

//     newSocket.on("receiveMessage", (msg: IMessage) => {
//       setMessages((prev) => [...prev, msg]);
//       if (selectedUser && msg.senderId !== doctorId) {
//         if (
//           !lastReadTimeRef.current[selectedUser.id] ||
//           new Date(msg.timestamp) > lastReadTimeRef.current[selectedUser.id]
//         ) {
//           updateUnreadCount(
//             selectedUser.id,
//             (prevCount) => (prevCount || 0) + 1
//           );
//         }
//       }
//     });

//     // Handle notifications
//     newSocket.on("newNotification", (notification: any) => {
//       // You can handle specific notifications here if needed
//       console.log("New notification received:", notification);
//     });

//     newSocket.on("error", (err: string) => {
//       setError(err);
//     });

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [doctorId, token, selectedUser]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!input.trim() || !selectedUser || !socket) return;

//     const messageData = {
//       userId: selectedUser.id,
//       doctorId,
//       message: input.trim(),
//     };

//     socket.emit("sendMessage", messageData);
//      // Send notification
//     socket.emit("message", {
//       userId: selectedUser.id,
//       doctorId,
//       message: input,
//       senderName: userName,
//     });

//     setInput("");
//   };

//   const updateUnreadCount = (
//     userId: string,
//     count: number | ((prevCount: number) => number)
//   ) => {
//     setUsers((prevUsers) =>
//       prevUsers.map((user) =>
//         user.id === userId
//           ? {
//               ...user,
//               unreadCount:
//                 typeof count === "function"
//                   ? count(user.unreadCount || 0)
//                   : count,
//             }
//           : user
//       )
//     );
//   };

//   const handleUserSelect = (user: IUser) => {
//     setSelectedUser(user);
//     socket?.emit("joinChat", { userId: user.id, doctorId });
//     lastReadTimeRef.current[user.id] = new Date();
//     updateUnreadCount(user.id, 0);
//     setMessages([]);
//   };

//   const filteredUsers = users.filter((user) =>
//     user.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen flex bg-gray-50">
//       {/* Sidebar */}
//       <aside className="w-1/4 max-w-xs border-r border-gray-200 bg-white p-4">
//         <h2 className="text-lg font-bold mb-4 text-gray-800">Chats</h2>
//         <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg mb-4">
//           <FaSearch className="text-gray-400 mr-2 text-sm" />
//           <input
//             type="text"
//             placeholder="Search conversations"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="outline-none bg-transparent w-full text-sm placeholder-gray-500"
//           />
//         </div>
//         {isLoading ? (
//           <div className="flex justify-center items-center h-64">
//             <FaSpinner className="animate-spin text-blue-500 text-2xl" />
//           </div>
//         ) : error ? (
//           <p className="text-red-500">{error}</p>
//         ) : filteredUsers.length === 0 ? (
//           <p className="text-gray-500 text-sm text-center p-4">
//             No chats available.
//           </p>
//         ) : (
//           <ul className="space-y-1.5">
//             {filteredUsers.map((user) => (
//               <li
//                 key={user.id}
//                 onClick={() => handleUserSelect(user)}
//                 className={cn(
//                   "flex items-center p-2.5 cursor-pointer rounded-lg transition-colors",
//                   selectedUser?.id === user.id
//                     ? "bg-blue-50"
//                     : "hover:bg-gray-100"
//                 )}
//               >
//                 <div className="relative">
//                   <img
//                     src={user.profilePicture || "profile.png"}
//                     alt={user.name}
//                     className="w-10 h-10 rounded-full mr-3 object-cover"
//                   />
//                   {user.online && (
//                     <span className="absolute bottom-0 right-3 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-sm truncate">{user.name}</p>
//                   <p className="text-xs text-gray-500 truncate">
//                     {user.lastMessage}
//                   </p>
//                 </div>
//                 <div className="flex flex-col items-end">
//                   <span className="text-xs text-gray-400 mb-1">
//                     {user.lastMessageTime
//                       ? new Date(user.lastMessageTime).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })
//                       : ""}
//                   </span>
//                   {user.unreadCount && user.unreadCount > 0 ? (
//                     <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
//                       {user.unreadCount}
//                     </span>
//                   ) : (
//                     ""
//                   )}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </aside>

//       {/* Chat Window */}
//       <main className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             {/* Chat header */}
//             <div className="border-b border-gray-200 bg-white p-4 flex items-center">
//               <div className="relative">
//                 <img
//                   src={selectedUser.profilePicture || "profile.png"}
//                   alt={selectedUser.name}
//                   className="w-12 h-12 rounded-full mr-4 object-cover"
//                 />
//                 {selectedUser.online && (
//                   <span className="absolute bottom-0 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
//                 )}
//               </div>
//               <div className="flex flex-col">
//                 <span className="font-semibold text-gray-800">
//                   {selectedUser.name}
//                 </span>
//                 <span className="text-xs text-gray-500">
//                   {selectedUser.online ? "Online" : "Last seen recently"}
//                 </span>
//               </div>
//               {/* <div className="ml-auto flex space-x-3">
//                 <button>
//                   <FaVideo className="text-lg" />
//                 </button>
//               </div> */}
//             </div>

//             {/* Messages area */}
//             <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//               <div className="space-y-3 max-w-3xl mx-auto">
//                 {messages.map((msg) => (
//                   <div
//                     key={msg._id}
//                     className={cn(
//                       "flex",
//                       msg.senderRole === "doctor"
//                         ? "justify-end"
//                         : "justify-start"
//                     )}
//                   >
//                     <div
//                       className={cn(
//                         "max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-sm",
//                         msg.senderRole === "doctor"
//                           ? "bg-blue-600 text-white rounded-br-none"
//                           : "bg-white text-gray-800 rounded-bl-none shadow-sm"
//                       )}
//                     >
//                       {msg.message}
//                       <div className="text-right mt-1">
//                         <span className="text-xs worker opacity-80">
//                           {new Date(msg.timestamp).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             {/* Message input */}
//             <div className="border-t border-gray-200 bg-white p-4">
//               <div className="flex items-center space-x-3">
//                 <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                   <FaPaperclip className="text-lg" />
//                 </button>
//                 <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                   <FaImage className="text-lg" />
//                 </button>
//                 <input
//                   type="text"
//                   placeholder="Type a message..."
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
//                   onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//                 />
//                 <button
//                   onClick={sendMessage}
//                   disabled={!input.trim()}
//                   className={cn(
//                     "p-2 rounded-full transition-colors",
//                     input.trim()
//                       ? "text-white bg-blue-500 hover:bg-green-600"
//                       : "text-gray-400 bg-gray-200 cursor-not-allowed"
//                   )}
//                 >
//                   <FaPaperPlane className="text-lg" />
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <p className="text-gray-500">Select a patient to start chatting</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default ChatPage;