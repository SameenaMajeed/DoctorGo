"use client";

import type React from "react";
import { Shield, ShieldCheck, Lock, Unlock, Eye } from "lucide-react";

interface TableActionsProps {
  onBlock: () => void;
  isBlocked: boolean;
  onViewDetails?: () => void;
  verificationStatus: string;
}

const TableActions: React.FC<TableActionsProps> = ({
  onBlock,
  isBlocked,
  onViewDetails, // Use the new prop
  verificationStatus,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* View Details Button */}
      {onViewDetails && (
        <div className="relative group">
          <button
            onClick={onViewDetails}
            className="group relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      )}

      {/* Block/Unblock Button */}
      <div className="relative group">
        <button
          onClick={onBlock}
          className={`group relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
            isBlocked
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:ring-emerald-500"
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500"
          }`}
          title={isBlocked ? "Unblock user" : "Block user"}
        >
          {isBlocked ? (
            <>
              <Unlock className="w-4 h-4" />
              <span className="hidden sm:inline">Unblock</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Block</span>
            </>
          )}
        </button>
      </div>

      {/* Status Indicator */}
      {verificationStatus && verificationStatus !== "pending" && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {verificationStatus === "approved" ? (
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
          ) : (
            <Shield className="w-3 h-3 text-gray-500" />
          )}
          <span className="hidden md:inline capitalize">
            {verificationStatus}
          </span>
        </div>
      )}
    </div>
  );
};

export default TableActions;

// import React from "react";

// interface TableActionsProps {
//   onBlock: () => void;
//   isBlocked: boolean;
//   onApprove: () => void;
//   // onReject: () => void;
//   verificationStatus: string;
// }

// const TableActions: React.FC<TableActionsProps> = ({
//   onBlock,
//   isBlocked,
//   onApprove,
//   // onReject,
//   verificationStatus,
// }) => {
//   return (
//     <div className="flex gap-2">
//       {verificationStatus === "pending" && (
//         <>
//           <button
//             onClick={onApprove}
//             className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
//           >
//             Approve
//           </button>
//           {/* <button
//             onClick={onReject}
//             className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
//           >
//             Reject
//           </button> */}
//         </>
//       )}
//       <button
//         onClick={onBlock}
//         className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
//           isBlocked
//             ? "bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//             : "bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//         } text-white shadow-sm`}
//       >
//         {isBlocked ? "Unblock" : "Block"}
//       </button>
//     </div>
//   );
// };

// export default TableActions;
