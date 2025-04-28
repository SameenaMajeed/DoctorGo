import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaPhone,
  FaPaperPlane,
  FaImage,
  FaPaperclip,
  FaEllipsisH,
  FaVideo,
} from "react-icons/fa";
import { cn } from "../../Utils/Utils";
import io, { Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { BaseUrl } from "../../constants";
import { RootState } from "../../slice/Store/Store";
import doctorApi from "../../axios/DoctorInstance";

type Message = {
  _id: string;
  senderId: string;
  senderRole: "user" | "doctor";
  message: string;
  timestamp: string | Date;
};

interface User {
  id: string;
  name: string;
  mobile_no?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  online?: boolean;
}

const SOCKET_URL = BaseUrl;

const ChatPage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          fetchedUsers.sort((a: User, b: User) => {
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

    newSocket.on("previousMessages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    newSocket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
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
            className="outline-none bg-transparent w-full text-sm placeholder-gray-500"
          />
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="space-y-1.5">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={cn(
                  "flex items-center p-2.5 cursor-pointer rounded-lg transition-colors",
                  selectedUser?.id === user.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-100"
                )}
              >
                <div className="relative">
                  <img
                    src={user.profilePicture || "https://i.pravatar.cc/150"}
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
                  src={
                    selectedUser.profilePicture || "https://i.pravatar.cc/150"
                  }
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
                <button className="text-gray-500 hover:text-blue-600 p-1.5 rounded-full hover:bg-gray-100">
                  <FaPhone className="text-sm" />
                </button>
                <button className="text-gray-500 hover:text-blue-600 p-1.5 rounded-full hover:bg-gray-100">
                  <FaVideo className="text-sm" />
                </button>
                <button className="text-gray-500 hover:text-blue-600 p-1.5 rounded-full hover:bg-gray-100">
                  <FaEllipsisH className="text-sm" />
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
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
