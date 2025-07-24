"use client";

import type React from "react";
import { AlertTriangle, X } from "lucide-react";

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  message: string;
  requireNote?: boolean;
  note?: string;
  setNote?: (note: string) => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  message,
  requireNote = false,
  note = "",
  setNote = () => {},
}) => {

  // const [noteError, setNoteError] = useState<string>("")
  const noteError = ""

  if (!isOpen) return null;

  // const handleConfirm = () => {
  //   if (requireNote && !note.trim()) {
  //     setNoteError("Note is required")
  //     return
  //   }
  //   setNoteError("")
  //   onConfirm()
  // }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ease-out"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out scale-100 animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center leading-relaxed">
              {message}
            </h2>

            {/* Note Field (if required) */}
            {requireNote && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your note here"
                />
                {noteError && <p className="text-sm text-red-500 mt-1">{noteError}</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onConfirm}
                className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="relative z-10">Yes, Confirm</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>

              <button
                onClick={onClose}
                className="group relative px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <span className="relative z-10">Cancel</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-gray-500 text-sm font-medium">DoctorGo</p>
              </div>
            </div>

            {/* Optional warning text - uncomment if needed */}
            {/* <p className="text-gray-600 text-sm text-center mt-2">
              Your used points will not be refunded
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default CancelConfirmationModal;

// import React from "react";

// interface CancelConfirmationModalProps {
//   isOpen: boolean;
//   onConfirm: () => void;
//   onClose: () => void;
//   message : string
// }

// const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
//   isOpen,
//   onConfirm,
//   onClose,
//   message
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">
//           {message}
//         </h2>
//         <div className="flex justify-center gap-6 mb-4">
//           <button
//             onClick={onConfirm}
//             className="px-6 py-2 bg-white border border-gray-300 rounded text-red-600 font-medium hover:bg-gray-100 transition"
//           >
//             yes
//           </button>
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
//           >
//             Go Back
//           </button>
//         </div>
//         <hr className="border-t border-gray-300 my-4" />
//         {/* <p className="text-gray-600 text-sm">
//           Your used points will not be refunded
//         </p> */}
//         <p className="text-gray-500 text-xs mt-2">DoctorGo</p>
//       </div>
//     </div>
//   );
// };

// export default CancelConfirmationModal;
