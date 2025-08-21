"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  FaSearch,
  FaPaperPlane,
  FaImage,
  FaPaperclip,
  FaSpinner,
} from "react-icons/fa"
import { cn } from "../../Utils/Utils"
import io, { Socket } from "socket.io-client"
import { useSelector } from "react-redux"
import type { RootState } from "../../slice/Store/Store"
// import userApi from "../../axios/UserInstance"
import { BaseUrl } from "../../constants"
import { createApiInstance } from "../../axios/apiService"

interface IMessage {
  userId: string
  doctorId: string
  senderId: string
  senderRole: "user" | "doctor"
  message: string
  timestamp: string | Date
  _id?: string
}

interface IDoctor {
  _id: string
  name: string
  email: string
  profilePicture?: string
  lastMessage?: string
  lastMessageTime?: string | Date
  online?: boolean
  specialization?: string
  qualification?: string
  unreadCount?: number
}

const SOCKET_URL = BaseUrl

const userApi = createApiInstance("user");

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [input, setInput] = useState<string>("")
  const [doctors, setDoctors] = useState<IDoctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [otherIsTyping, setOtherIsTyping] = useState(false)
  const [, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastReadTimeRef = useRef<{ [key: string]: Date }>({})
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const userId = useSelector((state: RootState) => state.user.user?.id)
  const userName = useSelector((state: RootState) => state.user.user?.name)
  const token = useSelector((state: RootState) => state.user.user?.accessToken)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!userId || !token) {
      setError("Please log in to access chat")
      return
    }

    const fetchDoctors = async () => {
      setIsLoading(true)
      try {
        const response = await userApi.get(`/chats/doctors/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log(response)
        const fetchedDoctors = response.data.data?.doctors || []
        const formattedDoctors = fetchedDoctors.map((doctor: any) => ({
          _id: doctor._id || doctor.id,
          name: doctor.name,
          email: doctor.email,
          profilePicture: doctor.profilePicture,
          specialization: doctor.specialization,
          qualification: doctor.qualification,
          lastMessage: doctor.lastMessage,
          lastMessageTime: doctor.lastMessageTime,
          online: doctor.online,
          unreadCount: 0,
        }))

        console.log('hloo',formattedDoctors)

        setDoctors(
          formattedDoctors.sort((a: IDoctor, b: IDoctor) => {
            const timeA = a.lastMessageTime
              ? new Date(a.lastMessageTime).getTime()
              : 0
            const timeB = b.lastMessageTime
              ? new Date(b.lastMessageTime).getTime()
              : 0
            return timeB - timeA
          })
        )
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch doctors")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      setIsConnected(true)
      setError(null)
    })

    newSocket.on("connect_error", (err: any) => {
      setIsConnected(false)
      setError("Connection failed: " + err.message)
    })

    newSocket.on("error", (error: string) => {
      setError(`Socket error: ${error}`)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [userId, token])

  useEffect(() => {
    if (!socket || !selectedDoctor || !isConnected) return

    socket.emit("joinChat", { userId, doctorId: selectedDoctor._id })

    socket.on("previousMessages", (previousMessages: IMessage[]) => {
      setMessages(previousMessages || [])
      setTimeout(scrollToBottom, 100)
      if (selectedDoctor) {
        lastReadTimeRef.current[selectedDoctor._id] = new Date()
        updateUnreadCount(selectedDoctor._id, 0)
      }
    })

    socket.on("receiveMessage", (message: IMessage) => {
      if (
        message.userId === userId &&
        message.doctorId === selectedDoctor._id
      ) {
        setMessages((prev) => [...prev, message])
        setTimeout(scrollToBottom, 100)
      }

      setDoctors((prev: IDoctor[]) => {
        const updated = prev.map((doctor) =>
          doctor._id === message.doctorId
            ? {
                ...doctor,
                lastMessage: message.message,
                lastMessageTime: message.timestamp,
              }
            : doctor
        )
        return updated.sort((a, b) => {
          const timeA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0
          return timeB - timeA
        })
      })

      if (
        selectedDoctor &&
        message.senderId !== userId &&
        message.doctorId === selectedDoctor._id &&
        (!lastReadTimeRef.current[selectedDoctor._id] ||
          new Date(message.timestamp) >
            lastReadTimeRef.current[selectedDoctor._id])
      ) {
        updateUnreadCount(
          selectedDoctor._id,
          (prevCount) => (prevCount || 0) + 1
        )
      }
    })

    socket.on("typing", (data: { isTyping: boolean }) => {
      setOtherIsTyping(data.isTyping)
    })

    socket.on("newNotification", (notification: any) => {
      console.log("New notification received:", notification)
    })

    return () => {
      socket.off("previousMessages")
      socket.off("receiveMessage")
      socket.off("typing")
      socket.off("newNotification")
    }
  }, [socket, selectedDoctor, isConnected, userId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (!socket || !selectedDoctor) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    socket.emit("typing", {
      userId,
      doctorId: selectedDoctor._id,
      isTyping: true,
    })

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        userId,
        doctorId: selectedDoctor._id,
        isTyping: false,
      })
    }, 2000)
  }

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedDoctor) return

    const messageData = {
      userId,
      doctorId: selectedDoctor._id,
      message: input,
    }

    socket.emit("sendMessage", messageData)

    socket.emit("message", {
      userId,
      doctorId: selectedDoctor._id,
      message: input,
      senderName: userName,
    })

    setDoctors((prev) =>
      prev
        .map((doctor) =>
          doctor._id === selectedDoctor._id
            ? {
                ...doctor,
                lastMessage: input,
                lastMessageTime: new Date().toISOString(),
              }
            : doctor
        )
        .sort((a, b) => {
          const timeA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0
          return timeB - timeA
        })
    )

    setInput("")
    setIsTyping(false)
  }

  const selectDoctor = (doctor: IDoctor) => {
    setSelectedDoctor(doctor)
    setMessages([])
    lastReadTimeRef.current[doctor._id] = new Date()
    updateUnreadCount(doctor._id, 0)
  }

  const updateUnreadCount = (
    doctorId: string,
    count: number | ((prevCount: number) => number)
  ) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor._id === doctorId
          ? {
              ...doctor,
              unreadCount:
                typeof count === "function"
                  ? count(doctor.unreadCount || 0)
                  : count,
            }
          : doctor
      )
    )
  }

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 font-sans">
      {/* Sidebar */}
      <aside className="w-1/4 max-w-sm border-r border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Messages</h2>
          <p className="text-sm text-slate-500">Connect with your doctors</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200/60">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400 text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100/70 border border-slate-200/60 rounded-xl text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
            />
          </div>
        </div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-3">
                <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                <p className="text-slate-500 text-sm">Loading conversations...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-slate-400 text-xl" />
              </div>
              <p className="text-slate-500 text-sm text-center">
                No conversations found
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => selectDoctor(doctor)}
                  className={cn(
                    "flex items-center p-4 m-2 cursor-pointer rounded-xl transition-all duration-200 hover:shadow-md group",
                    selectedDoctor?._id === doctor._id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="relative mr-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                      <img
                        src={doctor.profilePicture || "/profile.png"}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {doctor.online && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        selectedDoctor?._id === doctor._id ? "text-white" : "text-slate-800"
                      )}>
                        {doctor.name}
                      </p>
                      <span className={cn(
                        "text-xs",
                        selectedDoctor?._id === doctor._id ? "text-blue-100" : "text-slate-500"
                      )}>
                        {doctor.lastMessageTime
                          ? new Date(doctor.lastMessageTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-xs truncate",
                        selectedDoctor?._id === doctor._id ? "text-blue-100" : "text-slate-500"
                      )}>
                        {doctor.lastMessage || "No messages yet"}
                      </p>
                      {doctor.unreadCount && doctor.unreadCount > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full ml-2">
                          {doctor.unreadCount}
                        </span>
                      ) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm">
        {selectedDoctor ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/90 backdrop-blur-md p-6 flex items-center border-b border-slate-200/60 shadow-sm">
              <div className="relative mr-4">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-slate-200 shadow-sm">
                  <img
                    src={selectedDoctor.profilePicture || "/profile.png"}
                    alt={selectedDoctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedDoctor.online && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  {selectedDoctor.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    selectedDoctor.online
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full mr-1",
                      selectedDoctor.online ? "bg-green-400" : "bg-slate-400"
                    )}></span>
                    {selectedDoctor.online ? "Online" : "Offline"}
                  </span>
                  {otherIsTyping && (
                    <span className="text-sm text-blue-600 font-medium animate-pulse">
                      Typing...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isConnected ? (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={msg._id || `${msg.timestamp}-${idx}`}
                      className={cn(
                        "flex",
                        msg.senderRole === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm relative",
                          msg.senderRole === "user"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : "bg-white border border-slate-200 text-slate-800"
                        )}
                      >
                        <p className="break-words leading-relaxed">{msg.message}</p>
                        <div className="flex justify-end mt-2">
                          <span className={cn(
                            "text-xs",
                            msg.senderRole === "user" ? "text-blue-100" : "text-slate-500"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-4">
                    <FaSpinner className="animate-spin text-blue-500 text-3xl" />
                    <p className="text-slate-500 text-lg">Connecting to chat...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white/90 backdrop-blur-md p-4 border-t border-slate-200/60">
              <div className="flex items-center space-x-3 max-w-4xl mx-auto">
                <button className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md">
                  <FaPaperclip className="text-lg" />
                </button>
                <button className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md">
                  <FaImage className="text-lg" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="w-full bg-slate-100/70 border border-slate-200/60 rounded-2xl text-sm placeholder-slate-500 outline-none px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-200 shadow-md",
                    input.trim()
                      ? "text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:scale-105"
                      : "text-slate-400 bg-slate-200 cursor-not-allowed"
                  )}
                >
                  <FaPaperPlane className="text-lg" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaPaperPlane className="text-blue-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Start a Conversation
              </h3>
              <p className="text-slate-500 max-w-md">
                Select a doctor from the sidebar to begin your conversation
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Chat


// import React, { useState, useEffect, useRef } from "react";
// import {
//   FaSearch,
//   FaPaperPlane,
//   FaImage,
//   FaPaperclip,
//   FaSpinner,
//   // FaVideo,
//   // FaBell,
// } from "react-icons/fa";
// import { cn } from "../../Utils/Utils";
// import io, { Socket } from "socket.io-client";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import userApi from "../../axios/UserInstance";
// import { BaseUrl } from "../../constants";


// interface IMessage {
//   userId: string;
//   doctorId: string;
//   senderId: string;
//   senderRole: "user" | "doctor";
//   message: string;
//   timestamp: string | Date;
//   _id?: string;
// }

// interface IDoctor {
//   _id: string;
//   name: string;
//   email: string;
//   profilePicture?: string;
//   lastMessage?: string;
//   lastMessageTime?: string | Date;
//   online?: boolean;
//   specialization?: string;
//   qualification?: string;
//   unreadCount?: number;
// }

// const SOCKET_URL = BaseUrl;

// const Chat: React.FC = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [input, setInput] = useState<string>("");
//   const [doctors, setDoctors] = useState<IDoctor[]>([]);
//   const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [otherIsTyping, setOtherIsTyping] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const lastReadTimeRef = useRef<{ [key: string]: Date }>({});
//   const typingTimeoutRef = useRef<NodeJS.Timeout>();

//   const userId = useSelector((state: RootState) => state.user.user?.id);
//   const userName = useSelector((state: RootState) => state.user.user?.name);
//   const token = useSelector((state: RootState) => state.user.user?.accessToken);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     if (!userId || !token) {
//       setError("Please log in to access chat");
//       return;
//     }

//     const fetchDoctors = async () => {
//       setIsLoading(true);
//       try {
//         const response = await userApi.get(`/chats/doctors/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         console.log(response)

//         const fetchedDoctors = response.data.data?.doctors || [];
//         const formattedDoctors = fetchedDoctors.map((doctor: any) => ({
//           _id: doctor._id || doctor.id,
//           name: doctor.name,
//           email: doctor.email,
//           profilePicture: doctor.profilePicture,
//           specialization: doctor.specialization,
//           qualification: doctor.qualification,
//           lastMessage: doctor.lastMessage,
//           lastMessageTime: doctor.lastMessageTime,
//           online: doctor.online,
//           unreadCount: 0, // Initialize unread count
//         }));

//         setDoctors(
//           formattedDoctors.sort((a: IDoctor, b: IDoctor) => {
//             const timeA = a.lastMessageTime
//               ? new Date(a.lastMessageTime).getTime()
//               : 0;
//             const timeB = b.lastMessageTime
//               ? new Date(b.lastMessageTime).getTime()
//               : 0;
//             return timeB - timeA;
//           })
//         );
//         setError(null);
//       } catch (err: any) {
//         setError(err.response?.data?.message || "Failed to fetch doctors");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDoctors();

//     const newSocket = io(SOCKET_URL, {
//       auth: { token },
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       setIsConnected(true);
//       setError(null);
//     });

//     newSocket.on("connect_error", (err: any) => {
//       setIsConnected(false);
//       setError("Connection failed: " + err.message);
//     });

//     newSocket.on("error", (error: string) => {
//       setError(`Socket error: ${error}`);
//     });

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [userId, token]);

//   useEffect(() => {
//     if (!socket || !selectedDoctor || !isConnected) return;

//     // Join chat room
//     socket.emit("joinChat", { userId, doctorId: selectedDoctor._id });

//     // Handle previous messages
//     socket.on("previousMessages", (previousMessages: IMessage[]) => {
//       setMessages(previousMessages || []);
//       setTimeout(scrollToBottom, 100);

//       // Mark messages as read
//       if (selectedDoctor) {
//         lastReadTimeRef.current[selectedDoctor._id] = new Date();
//         updateUnreadCount(selectedDoctor._id, 0);
//       }
//     });

//     // Handle new messages
//     socket.on("receiveMessage", (message: IMessage) => {
//       if (
//         message.userId === userId &&
//         message.doctorId === selectedDoctor._id
//       ) {
//         setMessages((prev) => [...prev, message]);
//         setTimeout(scrollToBottom, 100);
//       }

//       // Update doctor list with last message
//       setDoctors((prev: IDoctor[]) => {
//         const updated = prev.map((doctor) =>
//           doctor._id === message.doctorId
//             ? {
//                 ...doctor,
//                 lastMessage: message.message,
//                 lastMessageTime: message.timestamp,
//               }
//             : doctor
//         );

//         return updated.sort((a, b) => {
//           const timeA = a.lastMessageTime
//             ? new Date(a.lastMessageTime).getTime()
//             : 0;
//           const timeB = b.lastMessageTime
//             ? new Date(b.lastMessageTime).getTime()
//             : 0;
//           return timeB - timeA;
//         });
//       });

//       // Update unread count if message is from another doctor and not in current chat
//       if (
//         selectedDoctor &&
//         message.senderId !== userId &&
//         message.doctorId === selectedDoctor._id &&
//         (!lastReadTimeRef.current[selectedDoctor._id] ||
//           new Date(message.timestamp) >
//             lastReadTimeRef.current[selectedDoctor._id])
//       ) {
//         updateUnreadCount(
//           selectedDoctor._id,
//           (prevCount) => (prevCount || 0) + 1
//         );
//       }
//     });

//     // Handle typing indicators
//     socket.on("typing", (data: { isTyping: boolean }) => {
//       setOtherIsTyping(data.isTyping);
//     });

//     // Handle notifications
//     socket.on("newNotification", (notification: any) => {
//       // You can handle specific notifications here if needed
//       console.log("New notification received:", notification);
//     });

//     return () => {
//       socket.off("previousMessages");
//       socket.off("receiveMessage");
//       socket.off("typing");
//       socket.off("newNotification");
//     };
//   }, [socket, selectedDoctor, isConnected, userId]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInput(e.target.value);

//     if (!socket || !selectedDoctor) return;

//     // Clear previous timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     // Emit typing start
//     socket.emit("typing", {
//       userId,
//       doctorId: selectedDoctor._id,
//       isTyping: true,
//     });

//     // Set timeout to emit typing stop
//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit("typing", {
//         userId,
//         doctorId: selectedDoctor._id,
//         isTyping: false,
//       });
//     }, 2000);
//   };

//   const sendMessage = () => {
//     if (!input.trim() || !socket || !isConnected || !selectedDoctor) return;

//     const messageData = {
//       userId,
//       doctorId: selectedDoctor._id,
//       message: input,
//     };

//     // Send message
//     socket.emit("sendMessage", messageData);

//     // Send notification
//     socket.emit("message", {
//       userId,
//       doctorId: selectedDoctor._id,
//       message: input,
//       senderName: userName,
//     });

//     // Update doctor list
//     setDoctors((prev) =>
//       prev
//         .map((doctor) =>
//           doctor._id === selectedDoctor._id
//             ? {
//                 ...doctor,
//                 lastMessage: input,
//                 lastMessageTime: new Date().toISOString(),
//               }
//             : doctor
//         )
//         .sort((a, b) => {
//           const timeA = a.lastMessageTime
//             ? new Date(a.lastMessageTime).getTime()
//             : 0;
//           const timeB = b.lastMessageTime
//             ? new Date(b.lastMessageTime).getTime()
//             : 0;
//           return timeB - timeA;
//         })
//     );

//     setInput("");
//     setIsTyping(false);
//   };

//   const selectDoctor = (doctor: IDoctor) => {
//     setSelectedDoctor(doctor);
//     setMessages([]);
//     lastReadTimeRef.current[doctor._id] = new Date();
//     updateUnreadCount(doctor._id, 0);
//   };

//   const updateUnreadCount = (
//     doctorId: string,
//     count: number | ((prevCount: number) => number)
//   ) => {
//     setDoctors((prevDoctors) =>
//       prevDoctors.map((doctor) =>
//         doctor._id === doctorId
//           ? {
//               ...doctor,
//               unreadCount:
//                 typeof count === "function"
//                   ? count(doctor.unreadCount || 0)
//                   : count,
//             }
//           : doctor
//       )
//     );
//   };

//   const filteredDoctors = doctors.filter((doctor) =>
//     doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen flex bg-gray-50 font-sans">
//       {/* Sidebar */}
//       <aside className="w-1/4 max-w-xs border-r border-gray-200 bg-white shadow-sm flex flex-col">
//         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
//           {/* <NotificationBell /> */}
//         </div>
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center bg-gray-100 rounded-lg p-2">
//             <FaSearch className="text-gray-500 mr-2" />
//             <input
//               type="text"
//               placeholder="Search doctors..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-transparent text-sm placeholder-gray-500 outline-none"
//             />
//           </div>
//         </div>
//         <div className="flex-1 overflow-y-auto">
//           {isLoading ? (
//             <div className="flex justify-center items-center h-64">
//               <FaSpinner className="animate-spin text-blue-500 text-2xl" />
//             </div>
//           ) : error ? (
//             <p className="text-red-500 text-sm p-4">{error}</p>
//           ) : filteredDoctors.length === 0 ? (
//             <p className="text-gray-500 text-sm text-center p-4">
//               No chats available
//             </p>
//           ) : (
//             <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
//               {filteredDoctors.map((doctor) => (
//                 <li
//                   key={doctor._id}
//                   onClick={() => selectDoctor(doctor)}
//                   className={cn(
//                     "flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors",
//                     selectedDoctor?._id === doctor._id && "bg-gray-100"
//                   )}
//                 >
//                   <div className="relative mr-3">
//                     <img
//                       src={doctor.profilePicture || "profile.png"}
//                       alt={doctor.name}
//                       className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                     />
//                     {doctor.online && (
//                       <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-800 truncate">
//                       {doctor.name}
//                     </p>
//                     <p className="text-xs text-gray-500 truncate">
//                       {doctor.lastMessage || "No messages yet"}
//                     </p>
//                   </div>
//                   <div className="flex flex-col items-end">
//                     <span className="text-xs text-gray-500">
//                       {doctor.lastMessageTime
//                         ? new Date(doctor.lastMessageTime).toLocaleTimeString(
//                             [],
//                             {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             }
//                           )
//                         : ""}
//                     </span>
//                     {doctor.unreadCount && doctor.unreadCount > 0 ? (
//                       <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full mt-1">
//                         {doctor.unreadCount}
//                       </span>
//                     ) : (
//                       ""
//                     )}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </aside>

//       {/* Chat Window */}
//       <main className="flex-1 flex flex-col bg-gray-100 overflow-y-auto">
//         {selectedDoctor ? (
//           <>
//             {/* Chat Header */}
//             <div className="bg-white p-4 flex items-center border-b border-gray-200 shadow-sm">
//               <div className="relative mr-4">
//                 <img
//                   src={selectedDoctor.profilePicture || "/default-profile.png"}
//                   alt={selectedDoctor.name}
//                   className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                 />
//                 {selectedDoctor.online && (
//                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
//                 )}
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-800">
//                   {selectedDoctor.name}
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   {selectedDoctor.online ? "Online" : "Offline"}
//                   {otherIsTyping && " • Typing..."}
//                 </p>
//               </div>
//               {/* <div className="ml-auto flex space-x-3">
//                 <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                   <FaVideo className="text-lg" />
//                 </button>
//               </div> */}
//             </div>

//             {/* Messages Area */}
//             <div className="flex-1 p-4 overflow-y-auto">
//               {isConnected ? (
//                 <div className="space-y-2 max-w-3xl mx-auto">
//                   {messages.map((msg, idx) => (
//                     <div
//                       key={msg._id || `${msg.timestamp}-${idx}`}
//                       className={cn(
//                         "flex",
//                         msg.senderRole === "user"
//                           ? "justify-end"
//                           : "justify-start"
//                       )}
//                     >
//                       <div
//                         className={cn(
//                           "max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm shadow-sm",
//                           msg.senderRole === "user"
//                             ? "bg-blue-500 text-white rounded-br-none"
//                             : "bg-gray-200 text-gray-800 rounded-bl-none"
//                         )}
//                       >
//                         <p className="break-words">{msg.message}</p>
//                         <div className="text-right mt-1">
//                           <span className="text-xs opacity-80">
//                             {new Date(msg.timestamp).toLocaleTimeString([], {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={messagesEndRef} />
//                 </div>
//               ) : (
//                 <p className="text-center text-gray-500 flex items-center justify-center h-full">
//                   <FaSpinner className="animate-spin mr-2" /> Connecting...
//                 </p>
//               )}
//             </div>

//             {/* Message Input */}
//             <div className="bg-white p-2 flex items-center border-t border-gray-200">
//               <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                 <FaPaperclip className="text-lg" />
//               </button>
//               <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                 <FaImage className="text-lg" />
//               </button>
//               <input
//                 type="text"
//                 placeholder="Type a message..."
//                 value={input}
//                 onChange={handleInputChange}
//                 onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//                 className="flex-1 bg-gray-100 rounded-full text-sm placeholder-gray-500 outline-none p-2 focus:ring-2 focus:ring-blue-200"
//               />
//               <button
//                 onClick={sendMessage}
//                 disabled={!input.trim()}
//                 className={cn(
//                   "p-2 rounded-full transition-colors",
//                   input.trim()
//                     ? "text-white bg-blue-500 hover:bg-blue-600"
//                     : "text-gray-400 bg-gray-200 cursor-not-allowed"
//                 )}
//               >
//                 <FaPaperPlane className="text-lg" />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-100">
//             <p className="text-gray-500 text-lg font-medium">
//               Select a doctor to start chatting
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Chat;
