
import React from "react";
import { Info } from "lucide-react";
import { IBooking } from "../../../Types";

interface Props {
  bookings: IBooking[];
  onViewDetails: (booking: IBooking) => void;
  isDarkMode: boolean;
}

const RecentBookingsTable: React.FC<Props> = ({ bookings, onViewDetails, isDarkMode }) => {
  return (
    <div className={`rounded-xl shadow-sm border mb-8 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
      <h2 className={`text-xl sm:text-2xl font-semibold p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>Recent Bookings</h2>
      <div className="overflow-x-auto p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            <tr>
              {["Doctor", "Patient", "Price", "Status", "Date", "Actions"].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id} className={`hover:bg-opacity-90 transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                  <td className="px-4 py-4 text-sm font-medium">{booking.doctor_id.name}</td>
                  <td className="px-4 py-4 text-sm">{booking.user_id.name}</td>
                  <td className="px-4 py-4 text-sm">₹{booking.ticketPrice.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === "completed"
                        ? isDarkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"
                        : booking.status === "cancelled"
                        ? isDarkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800"
                        : booking.status === "confirmed"
                        ? isDarkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
                        : isDarkMode ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(booking.appointmentDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <button
                      onClick={() => onViewDetails(booking)}
                      className={`flex items-center gap-1 ${
                        isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      <Info className="w-4 h-4" /> Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                  No recent bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentBookingsTable;
