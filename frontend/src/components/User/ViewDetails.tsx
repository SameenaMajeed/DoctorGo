import React from "react";
import { IAppointment } from "../../Types";
import { FaTimes, FaCalendarAlt, FaClock, FaUserMd, FaInfoCircle, FaVideo, FaStickyNote } from "react-icons/fa";

interface IViewDetailsProps {
  appointment: IAppointment;
  onClose: () => void;
}

const ViewDetails: React.FC<IViewDetailsProps> = ({ appointment, onClose }) => {
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return "Not specified";
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch {
      return "Invalid Time";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 hover:scale-[1.02] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-transform duration-200 hover:scale-110 focus:outline-none"
          aria-label="Close modal"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={
              appointment.doctor_id?.profilePicture ||
              "https://via.placeholder.com/100"
            }
            alt={appointment.doctor_id?.name || "Doctor"}
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow-md mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">
            {appointment.doctor_id?.name || "Unknown Doctor"}
          </h2>
          <p className="text-sm text-gray-500 italic mb-2">
            {appointment.doctor_id?.specialization || "No specialization"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FaUserMd className="text-blue-600 w-5 h-5" />
            <div className="text-left">
              <p className="text-sm text-gray-600 font-semibold">Qualification</p>
              <p className="text-gray-800">
                {appointment.doctor_id?.qualification || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-blue-600 w-5 h-5" />
            <div className="text-left">
              <p className="text-sm text-gray-600 font-semibold">Date</p>
              <p className="text-gray-800">{formatDate(appointment.appointmentDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaClock className="text-blue-600 w-5 h-5" />
            <div className="text-left">
              <p className="text-sm text-gray-600 font-semibold">Time Slot</p>
              <p className="text-gray-800">
                {appointment.slot_id
                  ? `${formatTime(appointment.slot_id.startTime)} - ${formatTime(
                      appointment.slot_id.endTime
                    )}`
                  : "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaInfoCircle className="text-blue-600 w-5 h-5" />
            <div className="text-left">
              <p className="text-sm text-gray-600 font-semibold">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyles(
                  appointment.status
                )}`}
              >
                {appointment.status || "Unknown"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaVideo className="text-blue-600 w-5 h-5" />
            <div className="text-left">
              <p className="text-sm text-gray-600 font-semibold">Consultation Type</p>
              <p className="text-gray-800">
                {appointment.modeOfAppointment || "Not mentioned"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetails;

// import React from "react";
// import { Appointment } from "../../Types";
// import { FaTimes } from "react-icons/fa";

// interface ViewDetailsProps {
//   appointment: Appointment;
//   onClose: () => void;
// }

// const ViewDetails: React.FC<ViewDetailsProps> = ({ appointment, onClose }) => {
//   const formatTime = (timeString: string | null | undefined) => {
//     if (!timeString) return "Not specified";
//     try {
//       const [hours, minutes] = timeString.split(":").map(Number);
//       const period = hours >= 12 ? "PM" : "AM";
//       const hours12 = hours % 12 || 12;
//       return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
//     } catch {
//       return "Invalid Time";
//     }
//   };

//   const formatDate = (dateString: string | null | undefined) => {
//     if (!dateString) return "Not specified";
//     try {
//       const date = new Date(dateString);
//       return date.toDateString();
//     } catch {
//       return "Invalid Date";
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
//         >
//           <FaTimes className="w-5 h-5" />
//         </button>

//         <div className="flex flex-col items-center text-center">
//           <img
//             src={
//               appointment.doctor_id?.profilePicture ||
//               "https://via.placeholder.com/100"
//             }
//             alt={appointment.doctor_id?.name || "Doctor"}
//             className="w-24 h-24 rounded-full object-cover border mb-4"
//           />
//           <h2 className="text-xl font-bold text-gray-800">
//             {appointment.doctor_id?.name || "Unknown Doctor"}
//           </h2>
//           <p className="text-sm text-gray-500 mb-1 italic">
//             {appointment.doctor_id?.specialization || "No specialization"}
//           </p>
//           <p className="text-sm text-gray-600 mb-3">
//             Qualification: {appointment.doctor_id?.qualification || "N/A"}
//           </p>

//           <div className="w-full text-left">
//             <p className="mb-1">
//               <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
//             </p>
//             <p className="mb-1">
//               <strong>Time Slot:</strong>{" "}
//               {appointment.slot_id
//                 ? `${formatTime(appointment.slot_id.startTime)} - ${formatTime(
//                     appointment.slot_id.endTime
//                   )}`
//                 : "Not specified"}
//             </p>
//             <p className="mb-1">
//               <strong>Status:</strong> {appointment.status}
//             </p>
//             <p className="mb-1">
//               <strong>Consultation Type:</strong>{" "}
//               {appointment.modeOfAppointment || "Not mentioned"}
//             </p>
//             {/* <p className="mb-1">
//               <strong>Notes:</strong>{" "}
//               {appointment.notes || "No additional notes provided."}
//             </p> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewDetails;
