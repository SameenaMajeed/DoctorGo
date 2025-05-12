
import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaPaperPlane,
  FaImage,
  FaPaperclip,
  FaSpinner,
  FaVideo,
} from "react-icons/fa";
import { cn } from "../../Utils/Utils";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import userApi from "../../axios/UserInstance";
import { BaseUrl } from "../../constants";

interface IMessage {
  userId: string;
  doctorId: string;
  senderId: string;
  senderRole: "user" | "doctor";
  message: string;
  timestamp: string | Date;
}

interface IDoctor {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  online?: boolean;
  specialization?: string;
  qualification?: string;
  unreadCount?: number;
}

const SOCKET_URL = BaseUrl;

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastReadTimeRef = useRef<{ [key: string]: Date }>({});

  const userId = useSelector((state: RootState) => state.user.user?.id);
  const token = useSelector((state: RootState) => state.user.user?.accessToken);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!userId || !token) {
      setError("Please log in to access chat");
      return;
    }

    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await userApi.get(`/chats/doctors/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedDoctors = response.data.data?.doctors || [];
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
        }));
        setDoctors(
          formattedDoctors.map((user: IDoctor) => ({
            ...user,
            unreadCount: 0,
          })).sort((a: IDoctor, b: IDoctor) => {
            const timeA = a.lastMessageTime
              ? new Date(a.lastMessageTime).getTime()
              : 0;
            const timeB = b.lastMessageTime
              ? new Date(b.lastMessageTime).getTime()
              : 0;
            return timeB - timeA;
          })
        );
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch doctors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("connect_error", (err: any) => {
      setIsConnected(false);
      setError("Connection failed: " + err.message);
    });

    newSocket.on("error", (error: string) => {
      setError(`Socket error: ${error}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, token]);

  useEffect(() => {
    if (!socket || !selectedDoctor || !isConnected) return;

    socket.emit("joinChat", { userId, doctorId: selectedDoctor._id });

    socket.on("previousMessages", (previousMessages: IMessage[]) => {
      setMessages(previousMessages || []);
      setTimeout(scrollToBottom, 100);
      if (selectedDoctor) {
        lastReadTimeRef.current[selectedDoctor._id] = new Date();
        updateUnreadCount(selectedDoctor._id, 0);
      }
    });

    socket.on("receiveMessage", (message: IMessage) => {
      if (message.userId === userId && message.doctorId === selectedDoctor._id) {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
      setDoctors((prev: any) => {
        const updated = prev.map((doctor: any) =>
          doctor._id === message.doctorId
            ? {
                ...doctor,
                lastMessage: message.message,
                lastMessageTime: message.timestamp,
              }
            : doctor
        );
        return updated.sort((a: any, b: any) => {
          const timeA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return timeB - timeA;
        });
      });

      if (
        selectedDoctor &&
        message.senderId !== userId &&
        message.doctorId === selectedDoctor._id &&
        (!lastReadTimeRef.current[selectedDoctor._id] ||
          new Date(message.timestamp) > lastReadTimeRef.current[selectedDoctor._id])
      ) {
        updateUnreadCount(selectedDoctor._id, (prevCount) => (prevCount || 0) + 1);
      }
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receiveMessage");
    };
  }, [socket, selectedDoctor, isConnected, userId]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedDoctor) return;

    const messageData = {
      userId,
      doctorId: selectedDoctor._id,
      message: input,
    };

    socket.emit("sendMessage", messageData);

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
            : 0;
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return timeB - timeA;
        })
    );
    setInput("");
  };

  const selectDoctor = (doctor: IDoctor) => {
    setSelectedDoctor(doctor);
    setMessages([]);
    lastReadTimeRef.current[doctor._id] = new Date();
    updateUnreadCount(doctor._id, 0);
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateUnreadCount = (doctorId: string, count: number | ((prevCount: number) => number)) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor._id === doctorId ? {
          ...doctor,
          unreadCount: typeof count === "function" ? count(doctor.unreadCount || 0) : count,
        } : doctor
      )
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-1/4 max-w-xs border-r border-gray-200 bg-white shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
          <div className="mt-2 flex items-center bg-gray-100 rounded-lg p-2">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm placeholder-gray-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm p-4">{error}</p>
          ) : filteredDoctors.length === 0 ? (
            <p className="text-gray-500 text-sm text-center p-4">No chats available.</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredDoctors.map((doctor) => (
                <li
                  key={doctor._id}
                  onClick={() => selectDoctor(doctor)}
                  className={cn(
                    "flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                    selectedDoctor?._id === doctor._id && "bg-gray-100"
                  )}
                >
                  <div className="relative mr-3">
                    <img
                      src={doctor.profilePicture || "profile.png"}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    {doctor.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {doctor.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {doctor.lastMessageTime
                        ? new Date(doctor.lastMessageTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                    {doctor.unreadCount && doctor.unreadCount > 0 ?
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                        {doctor.unreadCount}
                      </span> : ''
                    }
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-gray-100 overflow-y-auto">
        {selectedDoctor ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 flex items-center border-b border-gray-200 shadow-sm">
              <div className="relative mr-4">
                <img
                  src={selectedDoctor.profilePicture || "profile.png"}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                {selectedDoctor.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedDoctor.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedDoctor.online ? "online" : "last seen recently"}
                </p>
              </div>
              <div className="ml-auto flex space-x-3">
                 <button>
                     <FaVideo className="text-lg" />
                 </button>
               </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isConnected ? (
                <div className="space-y-2 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={`${msg.timestamp}-${msg.message}-${idx}`}
                      className={cn(
                        "flex",
                        msg.senderRole === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm shadow-sm",
                          msg.senderRole === "user"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        )}
                      >
                        <p className="break-words">{msg.message}</p>
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-800">
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
                <p className="text-center text-gray-500 flex items-center justify-center h-full">
                  <FaSpinner className="animate-spin mr-2" /> Connecting...
                </p>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white p-2 flex items-center border-t border-gray-200">
              <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
                <FaPaperclip className="text-lg" />
              </button>
              <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
                <FaImage className="text-lg" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-gray-100 rounded-full text-sm placeholder-gray-500 outline-none p-2 focus:ring-2 focus:ring-blue-200"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  input.trim()
                    ? "text-white bg-blue-500 hover:bg-blue-600"
                    : "text-gray-400 bg-gray-200 cursor-not-allowed"
                )}
              >
                <FaPaperPlane className="text-lg" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 text-lg font-medium">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;

// ..............................................................................................

// import React, { useState, useEffect, useRef } from "react";
// import {
//   FaSearch,
//   FaPaperPlane,
//   FaImage,
//   FaPaperclip,
//   FaVideo,
//   FaSpinner,
//   FaPhoneSlash,
// } from "react-icons/fa";
// import { cn } from "../../Utils/Utils";
// import io from "socket.io-client";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import userApi from "../../axios/UserInstance";
// import { BaseUrl } from "../../constants";
// import { JitsiMeeting } from '@jitsi/react-sdk';

// interface IMessage {
//   userId: string;
//   doctorId: string;
//   senderId: string;
//   senderRole: "user" | "doctor";
//   message: string;
//   timestamp: string | Date;
// }

// interface IDoctor {
//   _id: string;
//   name: string;
//   email: string;
//   profilePicture?: string;
//   lastMessage?: string;
//   lastMessageTime?: string;
//   online?: boolean;
//   specialization?: string;
//   qualification?: string;
//   unreadCount?: number;
// }

// const SOCKET_URL = BaseUrl;

// const Chat: React.FC = () => {
//   const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [input, setInput] = useState<string>("");
//   const [doctors, setDoctors] = useState<IDoctor[]>([]);
//   const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isVideoCallActive, setIsVideoCallActive] = useState(false);
//   const [videoCallRoom, setVideoCallRoom] = useState<string>("");
//   const [isCallWaiting, setIsCallWaiting] = useState(false);
//   const [callStatus, setCallStatus] = useState<string>("");

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const lastReadTimeRef = useRef<{ [key: string]: Date }>({});
//   const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const userId = useSelector((state: RootState) => state.user.user?.id);
//   const user = useSelector((state: RootState) => state.user.user);
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
//         }));
//         setDoctors(
//           formattedDoctors.map((user: IDoctor) => ({
//             ...user,
//             unreadCount: 0,
//           })).sort((a: IDoctor, b: IDoctor) => {
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

//     newSocket.on("startVideoCall", (data: { room: string }) => {
//       setVideoCallRoom(data.room);
//       setIsVideoCallActive(true);
//       setIsCallWaiting(false);
//       setCallStatus("Call connected");
//     });

//     newSocket.on("incomingVideoCall", (data: { room: string, callerName: string }) => {
//       // For doctor's side implementation
//       console.log(`Incoming call from ${data.callerName}`);
//     });

//     newSocket.on("videoCallRejected", () => {
//       setIsVideoCallActive(false);
//       setIsCallWaiting(false);
//       setCallStatus("Call rejected by doctor");
//       if (callTimeoutRef.current) {
//         clearTimeout(callTimeoutRef.current);
//       }
//     });

//     newSocket.on("endVideoCall", () => {
//       handleEndCall();
//     });

//     newSocket.on("doctorJoinedCall", () => {
//       setIsCallWaiting(false);
//       setCallStatus("Doctor joined the call");
//     });

//     return () => {
//       newSocket.disconnect();
//       if (callTimeoutRef.current) {
//         clearTimeout(callTimeoutRef.current);
//       }
//     };
//   }, [userId, token]);

//   useEffect(() => {
//     if (!socket || !selectedDoctor || !isConnected) return;

//     socket.emit("joinChat", { userId, doctorId: selectedDoctor._id });

//     socket.on("previousMessages", (previousMessages: IMessage[]) => {
//       setMessages(previousMessages || []);
//       setTimeout(scrollToBottom, 100);
//       if (selectedDoctor) {
//         lastReadTimeRef.current[selectedDoctor._id] = new Date();
//         updateUnreadCount(selectedDoctor._id, 0);
//       }
//     });

//     socket.on("receiveMessage", (message: IMessage) => {
//       if (message.userId === userId && message.doctorId === selectedDoctor._id) {
//         setMessages((prev) => [...prev, message]);
//         setTimeout(scrollToBottom, 100);
//       }
//       setDoctors((prev: any) => {
//         const updated = prev.map((doctor: any) =>
//           doctor._id === message.doctorId
//             ? {
//                 ...doctor,
//                 lastMessage: message.message,
//                 lastMessageTime: message.timestamp,
//               }
//             : doctor
//         );
//         return updated.sort((a: any, b: any) => {
//           const timeA = a.lastMessageTime
//             ? new Date(a.lastMessageTime).getTime()
//             : 0;
//           const timeB = b.lastMessageTime
//             ? new Date(b.lastMessageTime).getTime()
//             : 0;
//           return timeB - timeA;
//         });
//       });

//       if (
//         selectedDoctor &&
//         message.senderId !== userId &&
//         message.doctorId === selectedDoctor._id &&
//         (!lastReadTimeRef.current[selectedDoctor._id] ||
//           new Date(message.timestamp) > lastReadTimeRef.current[selectedDoctor._id])
//       ) {
//         updateUnreadCount(selectedDoctor._id, (prevCount) => (prevCount || 0) + 1);
//       }
//     });

//     return () => {
//       socket.off("previousMessages");
//       socket.off("receiveMessage");
//     };
//   }, [socket, selectedDoctor, isConnected, userId]);

//   const startVideoCall = () => {
//     if (!socket || !selectedDoctor || !isConnected) {
//       setError("Cannot start video call: No connection or doctor selected");
//       return;
//     }

//     const room = `video_user_${userId}_${selectedDoctor._id}`;
//     setIsVideoCallActive(true);
//     setIsCallWaiting(true);
//     setCallStatus("Waiting for doctor to join...");
//     setVideoCallRoom(room);

//     socket.emit("startVideoCall", {
//       userId,
//       doctorId: selectedDoctor._id,
//       room,
//       callerName: user?.name || "Patient",
//     });

//     // Set timeout for call waiting (30 seconds)
//     callTimeoutRef.current = setTimeout(() => {
//       if (isCallWaiting) {
//         // endVideoCall();
//         setCallStatus("Call timed out - doctor didn't respond");
//       }
//     }, 30000);
//   };

//   const handleEndCall = () => {
//     setIsVideoCallActive(false);
//     setIsCallWaiting(false);
//     setVideoCallRoom("");
//     if (callTimeoutRef.current) {
//       clearTimeout(callTimeoutRef.current);
//     }
//     if (socket && selectedDoctor) {
//       socket.emit("endVideoCall", {
//         userId,
//         doctorId: selectedDoctor._id,
//       });
//     }
//   };

//   const sendMessage = () => {
//     if (!input.trim() || !socket || !isConnected || !selectedDoctor) return;

//     const messageData = {
//       userId,
//       doctorId: selectedDoctor._id,
//       message: input,
//     };

//     socket.emit("sendMessage", messageData);

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
//   };

//   const selectDoctor = (doctor: IDoctor) => {
//     setSelectedDoctor(doctor);
//     setMessages([]);
//     lastReadTimeRef.current[doctor._id] = new Date();
//     updateUnreadCount(doctor._id, 0);
//   };

//   const filteredDoctors = doctors.filter((doctor) =>
//     doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const updateUnreadCount = (doctorId: string, count: number | ((prevCount: number) => number)) => {
//     setDoctors((prevDoctors) =>
//       prevDoctors.map((doctor) =>
//         doctor._id === doctorId ? {
//           ...doctor,
//           unreadCount: typeof count === "function" ? count(doctor.unreadCount || 0) : count,
//         } : doctor
//       )
//     );
//   };

//   return (
//     <div className="min-h-screen flex bg-gray-50 font-sans">
//       {/* Sidebar */}
//       <aside className="w-1/4 max-w-xs border-r border-gray-200 bg-white shadow-sm flex flex-col">
//         <div className="p-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
//           <div className="mt-2 flex items-center bg-gray-100 rounded-lg p-2">
//             <FaSearch className="text-gray-500 mr-2" />
//             <input
//               type="text"
//               placeholder="Search or start a new chat"
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
//             <p className="text-gray-500 text-sm text-center p-4">No chats available.</p>
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
//                       <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
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
//                         ? new Date(doctor.lastMessageTime).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })
//                         : ""}
//                     </span>
//                     {doctor.unreadCount && doctor.unreadCount > 0 ?
//                       <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
//                         {doctor.unreadCount}
//                       </span> : ''
//                     }
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
//                   src={selectedDoctor.profilePicture || "profile.png"}
//                   alt={selectedDoctor.name}
//                   className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                 />
//                 {selectedDoctor.online && (
//                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
//                 )}
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-800">
//                   {selectedDoctor.name}
//                 </h2>
//                 <p className="text-sm text-gray-500">
//                   {selectedDoctor.online ? "online" : "last seen recently"}
//                 </p>
//               </div>
//               <div className="ml-auto flex space-x-3">
//                 <button
//                   onClick={isVideoCallActive || isCallWaiting ? handleEndCall : startVideoCall}
//                   className={cn(
//                     "p-2 rounded-full transition-colors",
//                     isVideoCallActive || isCallWaiting
//                       ? "text-white bg-red-500 hover:bg-red-600"
//                       : "text-gray-700 bg-gray-200 hover:bg-gray-300"
//                   )}
//                 >
//                   {isVideoCallActive || isCallWaiting ? (
//                     <FaPhoneSlash className="text-lg" />
//                   ) : (
//                     <FaVideo className="text-lg" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {isVideoCallActive || isCallWaiting ? (
//               <div className="flex-1 p-4 bg-gray-100 flex flex-col">
//                 {isCallWaiting ? (
//                   <div className="flex flex-col items-center justify-center h-full">
//                     <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
//                       <h3 className="text-lg font-medium mb-2">Waiting for doctor to join...</h3>
//                       <p className="text-gray-600 mb-4">
//                         {callStatus || "The video call will start automatically when the doctor joins."}
//                       </p>
//                       <div className="flex justify-center space-x-4">
//                         <button
//                           onClick={handleEndCall}
//                           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//                         >
//                           Cancel Call
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <JitsiMeeting
//                     domain="meet.jit.si"
//                     roomName={videoCallRoom}
//                     configOverwrite={{
//                       startWithAudioMuted: true,
//                       startWithVideoMuted: true,
//                       disableModeratorIndicator: true,
//                       enableEmailInStats: false,
//                       startAudioOnly: false,
//                       enableWelcomePage: false,
//                       prejoinPageEnabled: false,
//                       requireDisplayName: true,
//                       enableNoisyMicDetection: true,
//                       constraints: {
//                         video: {
//                           height: {
//                             ideal: 720,
//                             max: 720,
//                             min: 240
//                           }
//                         }
//                       }
//                     }}
//                     interfaceConfigOverwrite={{
//                       DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
//                       TILE_VIEW_MAX_COLUMNS: 2,
//                       SHOW_JITSI_WATERMARK: false,
//                       SHOW_WATERMARK_FOR_GUESTS: false,
//                       SHOW_CHROME_EXTENSION_BANNER: false,
//                       MOBILE_APP_PROMO: false,
//                       HIDE_INVITE_MORE_HEADER: true
//                     }}
//                     userInfo={{
//                       displayName: user?.name || "User",
//                       email: user?.email || "",
//                     }}
//                     onApiReady={(externalApi) => {
//                       externalApi.addListener('participantRoleChanged', (data) => {
//                         if (data.role === 'moderator') {
//                           console.log('User is now moderator');
//                         }
//                       });

//                       externalApi.addListener("videoConferenceJoined", () => {
//                         console.log("User joined the conference");
//                       });

//                       externalApi.addListener("videoConferenceLeft", () => {
//                         handleEndCall();
//                       });

//                       externalApi.executeCommand('toggleLobby', false);
//                     }}
//                     getIFrameRef={(iframeRef) => {
//                       iframeRef.style.height = "100%";
//                       iframeRef.style.width = "100%";
//                       iframeRef.style.border = "none";
//                     }}
//                   />
//                 )}
//               </div>
//             ) : (
//               <>
//                 {/* Messages Area */}
//                 <div className="flex-1 p-4 overflow-y-auto">
//                   {isConnected ? (
//                     <div className="space-y-2 max-w-3xl mx-auto">
//                       {messages.map((msg, idx) => (
//                         <div
//                           key={`${msg.timestamp}-${msg.message}-${idx}`}
//                           className={cn(
//                             "flex",
//                             msg.senderRole === "user"
//                               ? "justify-end"
//                               : "justify-start"
//                           )}
//                         >
//                           <div
//                             className={cn(
//                               "max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm shadow-sm",
//                               msg.senderRole === "user"
//                                 ? "bg-blue-500 text-white rounded-br-none"
//                                 : "bg-gray-200 text-gray-800 rounded-bl-none"
//                             )}
//                           >
//                             <p className="break-words">{msg.message}</p>
//                             <div className="text-right mt-1">
//                               <span className="text-xs text-gray-800">
//                                 {new Date(msg.timestamp).toLocaleTimeString([], {
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   ) : (
//                     <p className="text-center text-gray-500 flex items-center justify-center h-full">
//                       <FaSpinner className="animate-spin mr-2" /> Connecting...
//                     </p>
//                   )}
//                 </div>

//                 {/* Message Input */}
//                 <div className="bg-white p-2 flex items-center border-t border-gray-200">
//                   <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                     <FaPaperclip className="text-lg" />
//                   </button>
//                   <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                     <FaImage className="text-lg" />
//                   </button>
//                   <input
//                     type="text"
//                     placeholder="Type a message..."
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     className="flex-1 bg-gray-100 rounded-full text-sm placeholder-gray-500 outline-none p-2 focus:ring-2 focus:ring-blue-200"
//                     onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//                   />
//                   <button
//                     onClick={sendMessage}
//                     disabled={!input.trim()}
//                     className={cn(
//                       "p-2 rounded-full transition-colors",
//                       input.trim()
//                         ? "text-white bg-blue-500 hover:bg-blue-600"
//                         : "text-gray-400 bg-gray-200 cursor-not-allowed"
//                     )}
//                   >
//                     <FaPaperPlane className="text-lg" />
//                   </button>
//                 </div>
//               </>
//             )}
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-100">
//             <p className="text-gray-500 text-lg font-medium">
//               Select a chat to start messaging
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Chat;
