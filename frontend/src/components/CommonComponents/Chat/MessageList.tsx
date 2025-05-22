
import React from "react";
import { FaSpinner } from "react-icons/fa";
import { cn } from "../../../Utils/Utils";
import { IMessage } from "../../../Types";

interface IMessageListProps {
  messages: IMessage[];
  isConnected: boolean;
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<IMessageListProps> = ({
  messages,
  isConnected,
  currentUserId,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {isConnected ? (
        <div className="space-y-2 max-w-3xl mx-auto">
          {messages.map((msg, idx) => (
            <div
              key={`${msg._id}-${idx}`}
              className={cn(
                "flex",
                msg.senderId === currentUserId
                  ? "justify-end"
                  : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm shadow-sm",
                  msg.senderId === currentUserId
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
  );
};

export default MessageList
