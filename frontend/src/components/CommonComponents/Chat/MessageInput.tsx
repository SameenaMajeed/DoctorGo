import React from "react";
import { FaImage, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { cn } from "../../../Utils/Utils";

interface IMessageInputProps {
  Input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isSending?: boolean;
}

const MessageInput: React.FC<IMessageInputProps> = ({
  Input,
  onInputChange,
  onSend,
  isSending = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending || !Input.trim()) return;
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white p-2 flex items-center border-t border-gray-200"
    >
      {/* Attachment buttons */}
      <button 
        type="button"
        className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
        disabled={isSending}
      >
        <FaPaperclip className="text-lg" />
      </button>
      <button 
        type="button"
        className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
        disabled={isSending}
      >
        <FaImage className="text-lg" />
      </button>

      {/* Message input */}
      <input
        type="text"
        placeholder="Type a message..."
        value={Input}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}
        disabled={isSending}
        className="flex-1 bg-gray-100 rounded-full text-sm placeholder-gray-500 outline-none p-2 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={!Input.trim() || isSending}
        className={cn(
          "p-2 rounded-full transition-colors",
          Input.trim()
            ? "text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400"
            : "text-gray-400 bg-gray-200 cursor-not-allowed",
          isSending && "animate-pulse"
        )}
      >
        <FaPaperPlane className="text-lg" />
      </button>
    </form>
  );
};

export default MessageInput;