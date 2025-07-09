
import React from "react";
import { Clock } from "lucide-react";

interface Props {
  count: number;
  isDarkMode: boolean;
}

const PendingApprovalsCard: React.FC<Props> = ({ count, isDarkMode }) => {
  return (
    <div className={`rounded-xl shadow-md p-4 ${isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" /> Pending Approvals
      </h3>
      <div className={`text-3xl font-bold ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>{count}</div>
      <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Doctors waiting for admin approval</p>
    </div>
  );
};

export default PendingApprovalsCard;
