import React from "react";

interface TableActionsProps {
  onBlock: () => void;
  isBlocked: boolean;
  onApprove: () => void;
  // onReject: () => void;
  verificationStatus: string;
}

const TableActions: React.FC<TableActionsProps> = ({
  onBlock,
  isBlocked,
  onApprove,
  // onReject,
  verificationStatus,
}) => {
  return (
    <div className="flex gap-2">
      {verificationStatus === "pending" && (
        <>
          <button
            onClick={onApprove}
            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
          >
            Approve
          </button>
          {/* <button
            onClick={onReject}
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
          >
            Reject
          </button> */}
        </>
      )}
      <button
        onClick={onBlock}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isBlocked
            ? "bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            : "bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        } text-white shadow-sm`}
      >
        {isBlocked ? "Unblock" : "Block"}
      </button>
    </div>
  );
};

export default TableActions;
