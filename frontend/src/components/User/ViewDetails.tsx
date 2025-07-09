// "use client"

// import type React from "react"
// import type { IAppointment } from "../../Types"
// import {
//   X,
//   Calendar,
//   Clock,
//   GraduationCap,
//   Video,
//   MapPin,
//   CheckCircle,
//   XCircle,
//   Clock3,
//   AlertCircle,
//   Phone,
//   Mail,
// } from "lucide-react"

// interface IViewDetailsProps {
//   appointment: IAppointment
//   onClose: () => void
// }

// const ViewDetails: React.FC<IViewDetailsProps> = ({ appointment, onClose }) => {
//   const formatTime = (timeString: string | null | undefined) => {
//     if (!timeString) return "Not specified"
//     try {
//       const [hours, minutes] = timeString.split(":").map(Number)
//       const period = hours >= 12 ? "PM" : "AM"
//       const hours12 = hours % 12 || 12
//       return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
//     } catch {
//       return "Invalid Time"
//     }
//   }

//   const formatDate = (dateString: string | null | undefined) => {
//     if (!dateString) return "Not specified"
//     try {
//       const date = new Date(dateString)
//       return date.toLocaleDateString("en-US", {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     } catch {
//       return "Invalid Date"
//     }
//   }

//   const getStatusConfig = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "scheduled":
//       case "confirmed":
//         return {
//           bg: "bg-gradient-to-r from-blue-50 to-blue-100",
//           text: "text-blue-800",
//           border: "border-blue-200",
//           icon: <Clock3 className="w-4 h-4" />,
//         }
//       case "completed":
//         return {
//           bg: "bg-gradient-to-r from-green-50 to-emerald-100",
//           text: "text-green-800",
//           border: "border-green-200",
//           icon: <CheckCircle className="w-4 h-4" />,
//         }
//       case "canceled":
//         return {
//           bg: "bg-gradient-to-r from-red-50 to-red-100",
//           text: "text-red-800",
//           border: "border-red-200",
//           icon: <XCircle className="w-4 h-4" />,
//         }
//       case "pending":
//         return {
//           bg: "bg-gradient-to-r from-yellow-50 to-amber-100",
//           text: "text-yellow-800",
//           border: "border-yellow-200",
//           icon: <AlertCircle className="w-4 h-4" />,
//         }
//       default:
//         return {
//           bg: "bg-gradient-to-r from-slate-50 to-slate-100",
//           text: "text-slate-800",
//           border: "border-slate-200",
//           icon: <Clock3 className="w-4 h-4" />,
//         }
//     }
//   }

//   const statusConfig = getStatusConfig(appointment.status)

//   const detailItems = [
//     {
//       icon: <GraduationCap className="w-5 h-5 text-green-500" />,
//       label: "Qualification",
//       value: appointment.doctor_id?.qualification || "Not specified",
//       bgColor: "bg-green-50",
//       borderColor: "border-green-200",
//     },
//     {
//       icon: <Calendar className="w-5 h-5 text-purple-500" />,
//       label: "Appointment Date",
//       value: formatDate(appointment.appointmentDate),
//       bgColor: "bg-purple-50",
//       borderColor: "border-purple-200",
//     },
//     {
//       icon: <Clock className="w-5 h-5 text-orange-500" />,
//       label: "Time Slot",
//       value: appointment.slot_id
//         ? `${formatTime(appointment.slot_id.startTime)} - ${formatTime(appointment.slot_id.endTime)}`
//         : "Not specified",
//       bgColor: "bg-orange-50",
//       borderColor: "border-orange-200",
//     },
//     {
//       icon: <MapPin className="w-5 h-5 text-indigo-500" />,
//       label: "Consultation Type",
//       value: appointment.modeOfAppointment || "Not specified",
//       bgColor: "bg-indigo-50",
//       borderColor: "border-indigo-200",
//     },
//   ]

//   return (
//     <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 w-full max-w-lg mx-auto overflow-hidden relative">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200/60">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200 hover:shadow-md"
//             aria-label="Close modal"
//           >
//             <X className="w-4 h-4 text-slate-600" />
//           </button>
//         </div>

//         {/* Doctor Profile Section */}
//         <div className="flex items-center gap-4">
//           <div className="relative">
//             <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
//               <img
//                 src={appointment.doctor_id?.profilePicture || "/placeholder.svg?height=80&width=80"}
//                 alt={appointment.doctor_id?.name || "Doctor"}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-sm"></div>
//           </div>

//           <div className="flex-1">
//             <h3 className="text-xl font-bold text-slate-800 mb-1">
//               Dr. {appointment.doctor_id?.name || "Unknown Doctor"}
//             </h3>
//             <p className="text-blue-600 font-medium text-sm mb-1">
//               {appointment.doctor_id?.specialization || "General Practice"}
//             </p>

//             {/* Status Badge */}
//             <div
//               className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
//             >
//               {statusConfig.icon}
//               {appointment.status || "Unknown"}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Details Section */}
//       <div className="p-6">
//         <div className="space-y-4 mb-6">
//           {detailItems.map((item, index) => (
//             <div
//               key={index}
//               className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${item.bgColor} ${item.borderColor}`}
//             >
//               <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
//                 {item.icon}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium text-slate-600 mb-1">{item.label}</p>
//                 <p className="text-base font-semibold text-slate-800 truncate">{item.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Additional Information */}
//         {appointment.modeOfAppointment?.toLowerCase() === "online" && (
//           <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
//             <div className="flex items-start gap-3">
//               <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                 <Video className="w-4 h-4 text-blue-600" />
//               </div>
//               <div>
//                 <h4 className="text-sm font-semibold text-blue-800 mb-1">Online Consultation</h4>
//                 <p className="text-sm text-blue-700">
//                   This is a video consultation. You'll receive a room ID via email before the appointment.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Contact Information (if available) */}
//         {(appointment.doctor_id?.email || appointment.doctor_id?.phone) && (
//           <div className="mb-6">
//             <h4 className="text-sm font-semibold text-slate-700 mb-3">Doctor Contact</h4>
//             <div className="space-y-2">
//               {appointment.doctor_id?.email && (
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <Mail className="w-4 h-4 text-slate-500" />
//                   <span>{appointment.doctor_id.email}</span>
//                 </div>
//               )}
//               {appointment.doctor_id?.phone && (
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <Phone className="w-4 h-4 text-slate-500" />
//                   <span>{appointment.doctor_id.phone}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Action Button */}
//         <div className="flex justify-center">
//           <button
//             onClick={onClose}
//             className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2"
//           >
//             <CheckCircle className="w-4 h-4" />
//             Got it
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ViewDetails



import React from "react";
import { IAppointment } from "../../Types";
import { FaTimes, FaCalendarAlt, FaClock, FaUserMd, FaInfoCircle, FaVideo} from "react-icons/fa";

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
