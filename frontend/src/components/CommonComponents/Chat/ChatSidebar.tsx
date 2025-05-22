import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { cn } from "../../../Utils/Utils";
import { IChatUser } from "../../../Types";

interface ChatSidebarProps {
  users: IChatUser[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedUser: IChatUser | null;
  onSelectUser: (user: IChatUser) => void;
  title: string;
  noChatsMessage: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  users,
  isLoading,
  error,
  searchQuery,
  setSearchQuery,
  selectedUser,
  onSelectUser,
  title,
  noChatsMessage,
}) => {
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-1/4 max-w-xs border-r border-gray-200 bg-white shadow-sm flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
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
            <div className="animate-spin text-blue-500 text-2xl">Loading...</div>
          </div>
        ) : error ? (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center p-4">{noChatsMessage}</p>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={cn(
                  "flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedUser?.id === user.id && "bg-gray-100"
                )}
              >
                <div className="relative mr-3">
                  <img
                    src={user.profilePicture || "profile.png"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  {user.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.lastMessage || "No messages yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">
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
                  ) : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;