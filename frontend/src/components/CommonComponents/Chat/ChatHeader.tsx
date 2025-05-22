import React from "react";
import {
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
  FaSignal,
} from "react-icons/fa";
import { cn } from "../../../Utils/Utils";
import { IChatUser } from "../../../Types";

interface IChatHeaderProps {
  contact: IChatUser;
  callActive: boolean;
  isCalling: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  videoQuality: "high" | "low";
  startCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleVideoQuality: () => void;
}

const ChatHeader: React.FC<IChatHeaderProps> = ({
  contact,
  callActive,
  isCalling,
  isAudioMuted,
  isVideoMuted,
  videoQuality,
  startCall,
  endCall,
  toggleAudio,
  toggleVideo,
  toggleVideoQuality,
}) => {
  return (
    <div className="bg-white p-4 flex items-center border-b border-gray-200 shadow-sm">
      <div className="relative mr-4">
        <img
          src={contact.profilePicture || "profile.png"}
          alt={contact.name}
          className="w-12 h-12 rounded-full object-cover border border-gray-200"
        />
        {contact.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{contact.name}</h2>
        <p className="text-sm text-gray-500">
          {contact.online ? "online" : "last seen recently"}
        </p>
      </div>
      <div className="ml-auto flex space-x-3">
        <button
          onClick={callActive ? endCall : startCall}
          disabled={isCalling || !contact.online}
          className={cn(
            "p-2 rounded-full transition-colors",
            callActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : isCalling || !contact.online
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
        >
          <FaVideo className="text-lg" />
        </button>
        {callActive && (
          <>
            <button
              onClick={toggleAudio}
              className={cn(
                "p-2 rounded-full transition-colors",
                isAudioMuted
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {isAudioMuted ? (
                <FaMicrophoneSlash className="text-lg" />
              ) : (
                <FaMicrophone className="text-lg" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className={cn(
                "p-2 rounded-full transition-colors",
                isVideoMuted
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              {isVideoMuted ? (
                <FaVideoSlash className="text-lg" />
              ) : (
                <FaVideo className="text-lg" />
              )}
            </button>
            <button
              onClick={toggleVideoQuality}
              className={cn(
                "p-2 rounded-full transition-colors bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              <FaSignal className="text-lg" />
              <span className="text-xs ml-1">
                {videoQuality === "high" ? "HD" : "SD"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;