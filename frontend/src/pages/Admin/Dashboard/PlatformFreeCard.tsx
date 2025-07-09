import React from "react";
import { formatCurrency } from "../../../Utils/formatters";

interface PlatformFreeCardProps {
  amount: number;
  isDarkMode: boolean;
}

const PlatformFreeCard: React.FC<PlatformFreeCardProps> = ({ amount, isDarkMode }) => {
  return (
    <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
            Platform Revenue
          </h3>
          <p className={`text-2xl font-bold mt-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {formatCurrency(parseFloat(amount.toFixed(2)))}
          </p>
        </div>
        <div className={`p-3 rounded-full ${isDarkMode ? "bg-gray-700 text-green-400" : "bg-green-100 text-green-600"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PlatformFreeCard;