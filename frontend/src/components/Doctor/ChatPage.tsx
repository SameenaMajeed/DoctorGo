
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
import io, { Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { BaseUrl } from "../../constants";
import { RootState } from "../../slice/Store/Store";
import doctorApi from "../../axios/DoctorInstance";

type IMessage = {
  _id: string;
  senderId: string;
  senderRole: "user" | "doctor";
  message: string;
  timestamp: string | Date;
};

interface IUser {
  id: string;
  name: string;
  mobile_no?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  online?: boolean;
  unreadCount?: number;
}

const SOCKET_URL = BaseUrl;

const ChatPage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastReadTimeRef = useRef<{ [key: string]: Date }>({});

  const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);
  const token = useSelector(
    (state: RootState) => state.doctor.doctor?.accessToken
  );

  useEffect(() => {
    if (!doctorId || !token) {
      setError("Please log in to access chat");
      return;
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await doctorApi.get(`/chats/users/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUsers = response.data.data?.users || [];
        setUsers(
          fetchedUsers
            .map((user: IUser) => ({
              ...user,
              unreadCount: 0,
            }))
            .sort((a: IUser, b: IUser) => {
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
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket");
      if (selectedUser) {
        newSocket.emit("joinChat", { userId: selectedUser.id, doctorId });
      }
    });

    newSocket.on("previousMessages", (msgs: IMessage[]) => {
      setMessages(msgs);
      if (selectedUser) {
        lastReadTimeRef.current[selectedUser.id] = new Date();
        updateUnreadCount(selectedUser.id, 0);
      }
    });

    newSocket.on("receiveMessage", (msg: IMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (selectedUser && msg.senderId !== doctorId) {
        if (
          !lastReadTimeRef.current[selectedUser.id] ||
          new Date(msg.timestamp) > lastReadTimeRef.current[selectedUser.id]
        ) {
          updateUnreadCount(
            selectedUser.id,
            (prevCount) => (prevCount || 0) + 1
          );
        }
      }
    });

    newSocket.on("error", (err: string) => {
      setError(err);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [doctorId, token, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !selectedUser || !socket) return;
    socket.emit("sendMessage", {
      userId: selectedUser.id,
      doctorId,
      message: input.trim(),
    });
    setInput("");
  };

  const updateUnreadCount = (
    userId: string,
    count: number | ((prevCount: number) => number)
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              unreadCount:
                typeof count === "function"
                  ? count(user.unreadCount || 0)
                  : count,
            }
          : user
      )
    );
  };

  const handleUserSelect = (user: IUser) => {
    setSelectedUser(user);
    socket?.emit("joinChat", { userId: user.id, doctorId });
    lastReadTimeRef.current[user.id] = new Date();
    updateUnreadCount(user.id, 0);
    setMessages([]);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-1/4 max-w-xs border-r border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Chats</h2>
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg mb-4">
          <FaSearch className="text-gray-400 mr-2 text-sm" />
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-none bg-transparent w-full text-sm placeholder-gray-500"
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center p-4">
            No chats available.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={cn(
                  "flex items-center p-2.5 cursor-pointer rounded-lg transition-colors",
                  selectedUser?.id === user.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-100"
                )}
              >
                <div className="relative">
                  <img
                    src={user.profilePicture || "profile.png"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  {user.online && (
                    <span className="absolute bottom-0 right-3 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400 mb-1">
                    {user.lastMessageTime
                      ? new Date(user.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                  {user.unreadCount && user.unreadCount > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                      {user.unreadCount}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="border-b border-gray-200 bg-white p-4 flex items-center">
              <div className="relative">
                <img
                  src={selectedUser.profilePicture || "profile.png"}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                {selectedUser.online && (
                  <span className="absolute bottom-0 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  {selectedUser.name}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedUser.online ? "Online" : "Last seen recently"}
                </span>
              </div>
              <div className="ml-auto flex space-x-3">
                <button>
                  <FaVideo className="text-lg" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={cn(
                      "flex",
                      msg.senderRole === "doctor"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-sm",
                        msg.senderRole === "doctor"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                      )}
                    >
                      {msg.message}
                      <div className="text-right mt-1">
                        <span className="text-xs worker opacity-80">
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
            </div>

            {/* Message input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-center space-x-3">
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
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    input.trim()
                      ? "text-white bg-blue-500 hover:bg-green-600"
                      : "text-gray-400 bg-gray-200 cursor-not-allowed"
                  )}
                >
                  <FaPaperPlane className="text-lg" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a patient to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;

// .....................................................................................................

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
// import io, { Socket } from "socket.io-client";
// import { useSelector } from "react-redux";
// import { BaseUrl } from "../../constants";
// import { RootState } from "../../slice/Store/Store";
// import doctorApi from "../../axios/DoctorInstance";
// import { JitsiMeeting } from "@jitsi/react-sdk";

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
//   const [isVideoCallActive, setIsVideoCallActive] = useState(false);
//   const [videoCallRoom, setVideoCallRoom] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [incomingCall, setIncomingCall] = useState<{
//     room: string;
//     callerName: string;
//     callerId: string;
//   } | null>(null);
//   const [isCallWaiting, setIsCallWaiting] = useState(false);
//   const [callStatus, setCallStatus] = useState("");

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const lastReadTimeRef = useRef<{ [key: string]: Date }>({});
//   const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);
//   const doctor = useSelector((state: RootState) => state.doctor.doctor);
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
//           fetchedUsers.map((user: IUser) => ({
//             ...user,
//             unreadCount: 0,
//           })).sort((a: IUser, b: IUser) => {
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

//     newSocket.on("incomingVideoCall", (data: { room: string; callerName: string; callerId: string }) => {
//       setIncomingCall(data);
//       setCallStatus(`Incoming call from ${data.callerName}`);
//     });

//     newSocket.on("videoCallInitiated", (data: { room: string }) => {
//       setVideoCallRoom(data.room);
//       setIsVideoCallActive(true);
//       setIsCallWaiting(false);
//       setCallStatus("Call connected");
//     });

//     newSocket.on("videoCallRejected", () => {
//       setIsVideoCallActive(false);
//       setIsCallWaiting(false);
//       setCallStatus("Call rejected by patient");
//       if (callTimeoutRef.current) {
//         clearTimeout(callTimeoutRef.current);
//       }
//     });

//     newSocket.on("endVideoCall", () => {
//       handleEndCall();
//     });

//     newSocket.on("error", (err: string) => {
//       setError(err);
//     });

//     return () => {
//       newSocket.disconnect();
//       if (callTimeoutRef.current) {
//         clearTimeout(callTimeoutRef.current);
//       }
//     };
//   }, [doctorId, token, selectedUser]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const startVideoCall = () => {
//     if (!socket || !selectedUser || !doctorId) {
//       setError("Cannot start video call: No connection or user selected");
//       return;
//     }

//     const room = `video_user_${selectedUser.id}_${doctorId}`;
//     setIsVideoCallActive(true);
//     setIsCallWaiting(true);
//     setCallStatus("Waiting for patient to join...");
//     setVideoCallRoom(room);

//     socket.emit("startVideoCall", {
//       userId: selectedUser.id,
//       doctorId,
//       room,
//       callerName: doctor?.name || "Doctor",
//     });

//     callTimeoutRef.current = setTimeout(() => {
//       if (isCallWaiting) {
//         // endVideoCall();
//         setCallStatus("Call timed out - patient didn't respond");
//       }
//     }, 30000);
//   };

//   const acceptCall = () => {
//     if (!socket || !incomingCall) return;

//     socket.emit("acceptVideoCall", {
//       room: incomingCall.room,
//       doctorId,
//       userId: incomingCall.callerId,
//     });

//     setVideoCallRoom(incomingCall.room);
//     setIsVideoCallActive(true);
//     setIsCallWaiting(false);
//     setIncomingCall(null);
//     setCallStatus("Call accepted");
//   };

//   const rejectCall = () => {
//     if (!socket || !incomingCall) return;

//     socket.emit("rejectVideoCall", {
//       userId: incomingCall.callerId,
//       doctorId,
//     });

//     setIncomingCall(null);
//     setIsVideoCallActive(false);
//     setIsCallWaiting(false);
//     setCallStatus("Call rejected");
//   };

//   const handleEndCall = () => {
//     setIsVideoCallActive(false);
//     setIsCallWaiting(false);
//     setVideoCallRoom("");
//     if (callTimeoutRef.current) {
//       clearTimeout(callTimeoutRef.current);
//     }
//     if (socket && selectedUser) {
//       socket.emit("endVideoCall", {
//         userId: selectedUser.id,
//         doctorId,
//       });
//     }
//   };

//   const sendMessage = () => {
//     if (!input.trim() || !selectedUser || !socket) return;
//     socket.emit("sendMessage", {
//       userId: selectedUser.id,
//       doctorId,
//       message: input.trim(),
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
//               <div className="ml-auto flex space-x-3">

//                 <button
//                   onClick={isVideoCallActive || isCallWaiting ? handleEndCall : startVideoCall}
//                   className={cn(
//                     "p-1.5 rounded-full transition-colors",
//                     isVideoCallActive || isCallWaiting
//                       ? "text-white bg-red-500 hover:bg-red-600"
//                       : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
//                   )}
//                 >
//                   {isVideoCallActive || isCallWaiting ? (
//                     <FaPhoneSlash className="text-sm" />
//                   ) : (
//                     <FaVideo className="text-sm" />
//                   )}
//                 </button>

//               </div>
//             </div>

//             {incomingCall ? (
//               <div className="flex-1 flex items-center justify-center bg-gray-50">
//                 <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
//                   <h3 className="text-lg font-medium mb-2">Incoming Video Call</h3>
//                   <p className="text-gray-600 mb-4">
//                     {callStatus || `Patient ${incomingCall.callerName} is calling`}
//                   </p>
//                   <div className="flex justify-center space-x-4">
//                     <button
//                       onClick={acceptCall}
//                       className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//                     >
//                       Accept
//                     </button>
//                     <button
//                       onClick={rejectCall}
//                       className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : isVideoCallActive || isCallWaiting ? (
//               <div className="flex-1 p-4 bg-gray-50 flex flex-col">
//                 {isCallWaiting ? (
//                   <div className="flex flex-col items-center justify-center h-full">
//                     <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
//                       <h3 className="text-lg font-medium mb-2">Waiting for patient to join...</h3>
//                       <p className="text-gray-600 mb-4">
//                         {callStatus || "The video call will start automatically when the patient joins."}
//                       </p>
//                       <div className="flex justify-center">
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
//                       disableModeratorIndicator: false,
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
//                             min: 240,
//                           },
//                         },
//                       },
//                     }}
//                     interfaceConfigOverwrite={{
//                       DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
//                       TILE_VIEW_MAX_COLUMNS: 2,
//                       SHOW_JITSI_WATERMARK: false,
//                       SHOW_WATERMARK_FOR_GUESTS: false,
//                       SHOW_CHROME_EXTENSION_BANNER: false,
//                       MOBILE_APP_PROMO: false,
//                       HIDE_INVITE_MORE_HEADER: true,
//                     }}
//                     userInfo={{
//                       displayName: doctor?.name || "Doctor",
//                       email: doctor?.email || "",
//                     }}
//                     onApiReady={(externalApi) => {
//                       externalApi.addListener("participantRoleChanged", (data) => {
//                         if (data.role === "moderator") {
//                           console.log("Doctor is now moderator");
//                         }
//                       });

//                       externalApi.addListener("videoConferenceJoined", () => {
//                         console.log("Doctor joined the conference");
//                       });

//                       externalApi.addListener("videoConferenceLeft", () => {
//                         handleEndCall();
//                       });

//                       externalApi.executeCommand("toggleLobby", false);
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
//                 {/* Messages area */}
//                 <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//                   <div className="space-y-3 max-w-3xl mx-auto">
//                     {messages.map((msg) => (
//                       <div
//                         key={msg._id}
//                         className={cn(
//                           "flex",
//                           msg.senderRole === "doctor"
//                             ? "justify-end"
//                             : "justify-start"
//                         )}
//                       >
//                         <div
//                           className={cn(
//                             "max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-sm",
//                             msg.senderRole === "doctor"
//                               ? "bg-blue-600 text-white rounded-br-none"
//                               : "bg-white text-gray-800 rounded-bl-none shadow-sm"
//                           )}
//                         >
//                           {msg.message}
//                           <div className="text-right mt-1">
//                             <span className="text-xs worker opacity-80">
//                               {new Date(msg.timestamp).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               })}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                   </div>
//                 </div>

//                 {/* Message input */}
//                 <div className="border-t border-gray-200 bg-white p-4">
//                   <div className="flex items-center space-x-3">
//                     <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                       <FaPaperclip className="text-lg" />
//                     </button>
//                     <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
//                       <FaImage className="text-lg" />
//                     </button>
//                     <input
//                       type="text"
//                       placeholder="Type a message..."
//                       value={input}
//                       onChange={(e) => setInput(e.target.value)}
//                       className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
//                       onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//                     />
//                     <button
//                       onClick={sendMessage}
//                       disabled={!input.trim()}
//                       className={cn(
//                         "p-2 rounded-full transition-colors",
//                         input.trim()
//                           ? "text-white bg-blue-500 hover:bg-green-600"
//                           : "text-gray-400 bg-gray-200 cursor-not-allowed"
//                       )}
//                     >
//                       <FaPaperPlane className="text-lg" />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
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
