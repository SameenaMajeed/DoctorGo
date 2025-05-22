import React from "react";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";

interface IncomingCallModalProps {
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerName,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-blue-600">
              {callerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-1">Incoming Video Call</h3>
          <p className="text-gray-600 mb-6">{callerName} is calling...</p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={onReject}
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <FaPhoneSlash size={24} />
            </button>
            <button
              onClick={onAccept}
              className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <FaPhone size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};