
import React from "react";
import { X } from "lucide-react";
import { IBooking } from "../../../Types";


interface Props {
  booking: IBooking;
  onClose: () => void;
  isDarkMode: boolean;
}

const BookingDetailsModal: React.FC<Props> = ({ booking, onClose, isDarkMode }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-2xl p-6 sm:p-8 w-full max-w-lg mx-4 shadow-lg ${isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold">Booking Details</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
            aria-label="Close booking details modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <p><span className="font-semibold">Booking ID:</span> {booking._id}</p>
          <p><span className="font-semibold">Doctor:</span> {booking.doctor_id.name} ({booking.doctor_id.specialty})</p>
          <p><span className="font-semibold">Patient:</span> {booking.user_id.name}</p>
          <p>
            <span className="font-semibold">Price:</span> ₹{booking.ticketPrice.toLocaleString()}
            {booking.discount && (
              <span className="text-green-600 dark:text-green-400"> (Discount: ₹{booking.discount})</span>
            )}
          </p>
          <p>
            <span className="font-semibold">Status:</span> <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
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
          </p>
          <p><span className="font-semibold">Date:</span> {new Date(booking.appointmentDate).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
