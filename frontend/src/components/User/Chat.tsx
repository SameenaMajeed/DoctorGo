import React, { ReactNode, useState } from "react";
import { FaSearch, FaPhone, FaPaperPlane, FaImage, FaPaperclip, FaEllipsisH, FaVideo } from "react-icons/fa";
import { cn } from "../../Utils/Utils";

type User = {
  time: ReactNode;
  lastMessage: ReactNode;
  online: any;
  name: string;
  phone: string;
  avatar: string;
  unread: number;
};

type Message = {
  sender: "self" | "other";
  text: string;
};

const users: User[] = [
  {
      name: "Aria Joseph",
      phone: "+91-9874286294",
      avatar: "https://i.pravatar.cc/150?img=32",
      unread: 1,
      online: undefined,
      time: undefined,
      lastMessage: undefined
  },
  {
      name: "George Gregory",
      phone: "+91-9874286295",
      avatar: "https://i.pravatar.cc/150?img=33",
      unread: 2,
      online: undefined,
      time: undefined,
      lastMessage: undefined
  },
];

const initialMessages: Message[] = [
  { sender: "other", text: "Hello!" },
  { sender: "self", text: "Hi there!" },
  { sender: "self", text: "How are you?" },
  { sender: "other", text: "I'm good, thanks!" },
];

const Chat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "self", text: input.trim() }]);
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
        <ul className="space-y-1.5">
          {users.map((user) => (
            <li
              key={user.name}
              onClick={() => setSelectedUser(user)}
              className={cn(
                "flex items-center p-2.5 cursor-pointer rounded-lg transition-colors",
                selectedUser.name === user.name
                  ? "bg-blue-50"
                  : "hover:bg-gray-100"
              )}
            >
              <div className="relative">
                <img
                  src={user.avatar}
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
                <span className="text-xs text-gray-400 mb-1">{user.time}</span>
                {user.unread > 0 && (
                  <span className="text-xs bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {user.unread}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="border-b border-gray-200 bg-white p-4 flex items-center">
          <div className="relative">
            <img
              src={selectedUser.avatar}
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
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  msg.sender === "self" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-sm",
                    msg.sender === "self"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                  )}
                >
                  {msg.text}
                  <div className="text-right mt-1">
                    <span className="text-xs opacity-80">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
              className="text-white bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full transition-colors"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
