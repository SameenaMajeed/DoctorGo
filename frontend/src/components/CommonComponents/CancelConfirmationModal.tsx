import React from "react";

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  message : string
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {message}
        </h2>
        <div className="flex justify-center gap-6 mb-4">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-white border border-gray-300 rounded text-red-600 font-medium hover:bg-gray-100 transition"
          >
            yes
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
        <hr className="border-t border-gray-300 my-4" />
        {/* <p className="text-gray-600 text-sm">
          Your used points will not be refunded
        </p> */}
        <p className="text-gray-500 text-xs mt-2">DoctorGo</p>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;