// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { toast } from "react-toastify"
// import type { IAppointment } from "../../Types"
// import api from "../../axios/UserInstance"
// import "react-toastify/dist/ReactToastify.css"
// import { Link, useNavigate } from "react-router-dom"
// import ReviewForm from "./ReviewForm"
// import ViewDetails from "./ViewDetails"
// import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal"
// import {
//   ClipboardList,
//   Calendar,
//   Clock,
//   MapPin,
//   Video,
//   Star,
//   Eye,
//   Trash2,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Clock3,
// } from "lucide-react"

// interface IAppointmentCardProps {
//   appointment: IAppointment
//   onCancel: (id: string) => void
// }

// const AppointmentCard: React.FC<IAppointmentCardProps> = ({ appointment, onCancel }) => {
//   const [showReviewForm, setShowReviewForm] = useState(false)
//   const [showViewDetails, setShowViewDetails] = useState(false)
//   const [isCanceling, setIsCanceling] = useState(false)
//   const [showCancelModal, setShowCancelModal] = useState(false)
//   const [existingReview, setExistingReview] = useState<any>(null)
//   const [isCheckingReview, setIsCheckingReview] = useState(false)
//   const [roomIdInput, setRoomIdInput] = useState<string>("")
//   const navigate = useNavigate()

//   // Check for existing review when component mounts or appointment changes
//   useEffect(() => {
//     if (appointment.status.toLowerCase() === "completed") {
//       checkForExistingReview()
//     }
//   }, [appointment])

//   const checkForExistingReview = async () => {
//     setIsCheckingReview(true)
//     try {
//       const response = await api.get(`/reviews/check?appointmentId=${appointment._id}`)
//       console.log("existing reviews :", response.data.data.existingReview)
//       setExistingReview(response.data.data.existingReview || null)
//     } catch (error) {
//       console.error("Error checking for review:", error)
//       setExistingReview(null)
//     } finally {
//       setIsCheckingReview(false)
//     }
//   }

//   const handleCancel = async () => {
//     setShowCancelModal(true)
//   }

//   const handleConfirmCancel = async () => {
//     setShowCancelModal(false)
//     setIsCanceling(true)
//     const toastId = toast.loading("Cancelling appointment...")
//     try {
//       const response = await api.patch(`/appointments/${appointment._id}/cancel`)
//       console.log(response)
//       if (response.status === 200) {
//         onCancel(appointment._id)
//         toast.update(toastId, {
//           render: "Appointment canceled successfully!",
//           type: "success",
//           isLoading: false,
//           autoClose: 3000,
//           closeOnClick: true,
//         })
//       }
//     } catch (error: any) {
//       toast.update(toastId, {
//         render: "Failed to cancel the appointment. Please try again.",
//         type: "error",
//         isLoading: false,
//         autoClose: 3000,
//         closeOnClick: true,
//       })
//       console.error(error)
//     }
//     setIsCanceling(false)
//   }

//   const handleCloseModal = () => {
//     setShowCancelModal(false)
//   }

//   const handleAddOrEditReview = () => {
//     setShowReviewForm(true)
//   }

//   const handleCloseReviewForm = () => {
//     setShowReviewForm(false)
//     checkForExistingReview()
//   }

//   const handleViewDetails = () => {
//     setShowViewDetails(true)
//   }

//   const handleCloseViewDetails = () => {
//     setShowViewDetails(false)
//   }

//   const handleJoinVideoCall = () => {
//     if (!roomIdInput.trim()) {
//       toast.error("Please enter a valid Room ID")
//       return
//     }
//     navigate(`/user/video-call?roomId=${roomIdInput}&bookingId=${appointment._id}`)
//   }

//   const formatTimeString = (timeString: string | null | undefined) => {
//     if (!timeString) return "Not specified"
//     if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
//       const [hours, minutes] = timeString.split(":").map(Number)
//       const period = hours >= 12 ? "PM" : "AM"
//       const hours12 = hours % 12 || 12
//       return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
//     }
//     try {
//       const date = new Date(timeString)
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         })
//       }
//     } catch (error) {
//       console.error("Error formatting time:", error)
//     }
//     return "Invalid Time"
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
//     } catch (error) {
//       console.error("Error formatting date:", error)
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

//   const isAppointmentToday = (appointmentDate: string | null | undefined) => {
//     if (!appointmentDate) return false
//     try {
//       const appointmentDay = new Date(appointmentDate)
//       const today = new Date()
//       return (
//         appointmentDay.getFullYear() === today.getFullYear() &&
//         appointmentDay.getMonth() === today.getMonth() &&
//         appointmentDay.getDate() === today.getDate()
//       )
//     } catch (error) {
//       console.error("Error comparing dates:", error)
//       return false
//     }
//   }

//   const statusConfig = getStatusConfig(appointment.status)

//   return (
//     <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 group">
//       {/* Status Bar */}
//       <div className={`h-2 ${statusConfig.bg.replace("from-", "from-").replace("to-", "to-")}`}></div>

//       <div className="p-6">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
//           {/* Doctor Info Section */}
//           <div className="flex items-start gap-4 flex-1">
//             {/* Doctor Avatar */}
//             <div className="relative flex-shrink-0">
//               <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
//                 <img
//                   src={appointment.doctor_id?.profilePicture || "/placeholder.svg?height=80&width=80"}
//                   alt={appointment.doctor_id?.name || "Doctor"}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-sm"></div>
//             </div>

//             {/* Doctor Details */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
//                     Dr. {appointment.doctor_id?.name || "Unknown Doctor"}
//                   </h3>
//                   <p className="text-blue-600 font-medium text-sm mb-1">
//                     {appointment.doctor_id?.specialization || "General Practice"}
//                   </p>
//                   <p className="text-slate-500 text-sm">
//                     {appointment.doctor_id?.qualification || "Medical Professional"}
//                   </p>
//                 </div>

//                 {/* Status Badge */}
//                 <div
//                   className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
//                 >
//                   {statusConfig.icon}
//                   {appointment.status || "Unknown"}
//                 </div>
//               </div>

//               {/* Appointment Details Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//                 <div className="flex items-center gap-2 text-slate-600">
//                   <Calendar className="w-4 h-4 text-blue-500" />
//                   <span className="font-medium">Date:</span>
//                   <span>{formatDate(appointment.appointmentDate)}</span>
//                 </div>

//                 <div className="flex items-center gap-2 text-slate-600">
//                   <Clock className="w-4 h-4 text-green-500" />
//                   <span className="font-medium">Time:</span>
//                   <span>
//                     {appointment.slot_id
//                       ? `${formatTimeString(appointment.slot_id.startTime)} - ${formatTimeString(
//                           appointment.slot_id.endTime,
//                         )}`
//                       : "Time not specified"}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2 text-slate-600">
//                   <MapPin className="w-4 h-4 text-purple-500" />
//                   <span className="font-medium">Mode:</span>
//                   <span className="capitalize">{appointment.modeOfAppointment || "Not specified"}</span>
//                 </div>

//                 {appointment.modeOfAppointment?.toLowerCase() === "online" && (
//                   <div className="flex items-center gap-2 text-slate-600">
//                     <Video className="w-4 h-4 text-indigo-500" />
//                     <span className="font-medium">Platform:</span>
//                     <span>Video Call</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Actions Section */}
//           <div className="flex flex-col gap-3 lg:items-end lg:min-w-[200px]">
//             {appointment.status.toLowerCase() === "completed" ? (
//               <>
//                 <button
//                   onClick={handleViewDetails}
//                   className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md hover:scale-105"
//                 >
//                   <Eye className="w-4 h-4" />
//                   View Details
//                 </button>

//                 <Link
//                   to={`/prescription/${appointment._id}`}
//                   className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md hover:scale-105"
//                 >
//                   <ClipboardList className="w-4 h-4" />
//                   Prescription
//                 </Link>

//                 <button
//                   onClick={handleAddOrEditReview}
//                   disabled={isCheckingReview}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${
//                     existingReview
//                       ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
//                       : "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
//                   } ${isCheckingReview ? "opacity-50 cursor-not-allowed" : ""}`}
//                 >
//                   <Star className="w-4 h-4" />
//                   {isCheckingReview ? "Checking..." : existingReview ? "Edit Review" : "Add Review"}
//                 </button>
//               </>
//             ) : appointment.status.toLowerCase() === "confirmed" &&
//               appointment.modeOfAppointment.toLowerCase() === "online" &&
//               isAppointmentToday(appointment.appointmentDate) ? (
//               <>
//                 <div className="flex flex-col gap-2 w-full">
//                   <input
//                     type="text"
//                     value={roomIdInput}
//                     onChange={(e) => setRoomIdInput(e.target.value)}
//                     placeholder="Enter Room ID from email"
//                     className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
//                   />
//                   <button
//                     onClick={handleJoinVideoCall}
//                     className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md hover:scale-105"
//                   >
//                     <Video className="w-4 h-4" />
//                     Join Video Call
//                   </button>
//                 </div>

//                 <button
//                   onClick={handleCancel}
//                   disabled={isCanceling}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md ${
//                     isCanceling
//                       ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
//                       : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:scale-105"
//                   }`}
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   {isCanceling ? "Canceling..." : "Cancel"}
//                 </button>
//               </>
//             ) : appointment.status.toLowerCase() === "confirmed" &&
//               appointment.modeOfAppointment.toLowerCase() === "online" ? (
//               <div className="text-sm text-slate-500 italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
//                 <Video className="w-4 h-4 inline mr-1" />
//                 Video call available on {formatDate(appointment.appointmentDate)}
//               </div>
//             ) : (
//               appointment.status.toLowerCase() !== "failed" &&
//               appointment.status.toLowerCase() !== "canceled" && (
//                 <button
//                   onClick={handleCancel}
//                   disabled={isCanceling}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md ${
//                     isCanceling
//                       ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
//                       : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:scale-105"
//                   }`}
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   {isCanceling ? "Canceling..." : "Cancel"}
//                 </button>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modals - Traditional Overlay Style */}
//       {showViewDetails && <ViewDetails appointment={appointment} onClose={handleCloseViewDetails} />}

//       {showReviewForm && (
//         <ReviewForm
//           doctorId={appointment.doctor_id._id}
//           doctorName={appointment.doctor_id?.name || "Unknown Doctor"}
//           appointmentDate={appointment.appointmentDate}
//           appointmentId={appointment._id}
//           onClose={handleCloseReviewForm}
//           existingReview={existingReview}
//         />
//       )}

//       <CancelConfirmationModal
//         isOpen={showCancelModal}
//         onConfirm={handleConfirmCancel}
//         onClose={handleCloseModal}
//         message={`Are you sure you want to cancel this appointment with Dr. ${appointment.doctor_id?.name}?`}
//       />
//     </div>
//   )
// }

// export default AppointmentCard



import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IAppointment } from "../../Types";
import api from "../../axios/UserInstance";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import ReviewForm from "./ReviewForm";
import { FaInfoCircle, FaStar, FaTrashAlt, FaVideo } from "react-icons/fa";
import ViewDetails from "./ViewDetails";
import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal";
import { ClipboardList } from "lucide-react";

interface IAppointmentCardProps {
  appointment: IAppointment;
  onCancel: (id: string) => void;
}

const AppointmentCard: React.FC<IAppointmentCardProps> = ({
  appointment,
  onCancel,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isCheckingReview, setIsCheckingReview] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState<string>("");
  const navigate = useNavigate();

  // Check for existing review when component mounts or appointment changes
  useEffect(() => {
    if (appointment.status.toLowerCase() === "completed") {
      checkForExistingReview();
    }
  }, [appointment]);

  const checkForExistingReview = async () => {
    setIsCheckingReview(true);
    try {
      const response = await api.get(
        `/reviews/check?appointmentId=${appointment._id}`
      );

      console.log("exixting reviews :", response.data.data.existingReview);
      setExistingReview(response.data.data.existingReview || null);
    } catch (error) {
      console.error("Error checking for review:", error);
      setExistingReview(null);
    } finally {
      setIsCheckingReview(false);
    }
  };

  const handleCancel = async () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    setIsCanceling(true);
    const toastId = toast.loading("Cancelling appointment...");

    try {
      const response = await api.patch(
        `/appointments/${appointment._id}/cancel`
      );

      console.log(response.data.data);
      if (response.status === 200) {
        onCancel(appointment._id);
        toast.update(toastId, {
          render: "Appointment canceled successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
        });
      }
    } catch (error: any) {
      toast.update(toastId, {
        render: "Failed to cancel the appointment. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      console.error(error);
    }
    setIsCanceling(false);
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
  };

  const handleAddOrEditReview = () => {
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    checkForExistingReview();
  };

  const handleViewDetails = () => {
    setShowViewDetails(true);
  };

  const handleCloseViewDetails = () => {
    setShowViewDetails(false);
  };

  const handleJoinVideoCall = () => {
    if (!roomIdInput.trim()) {
      toast.error("Please enter a valid Room ID");
      return;
    }
    navigate(
      `/user/video-call?roomId=${roomIdInput}&bookingId=${appointment._id}`
    );
  };

  const formatTimeString = (timeString: string | null | undefined) => {
    if (!timeString) return "Not specified";
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
    }

    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("Error formatting time:", error);
    }

    return "Invalid Time";
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
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

  const isAppointmentToday = (appointmentDate: string | null | undefined) => {
    if (!appointmentDate) return false;

    try {
      const appointmentDay = new Date(appointmentDate);
      const today = new Date();

      // Compare year, month, and day
      return (
        appointmentDay.getFullYear() === today.getFullYear() &&
        appointmentDay.getMonth() === today.getMonth() &&
        appointmentDay.getDate() === today.getDate()
      );
    } catch (error) {
      console.error("Error comparing dates:", error);
      return false;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl shadow-md mb-6 border hover:shadow-lg transition-all duration-300">
      <div className="flex items-center w-full md:w-auto gap-4">
        <img
          src={
            appointment.doctor_id?.profilePicture ||
            "/profile.png"
          }
          alt={appointment.doctor_id?.name || "Doctor"}
          className="w-20 h-20 rounded-full border object-cover"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">
            {appointment.doctor_id?.name || "Unknown Doctor"}
          </h2>
          <p className="text-sm text-gray-500 italic">
            {appointment.doctor_id?.specialization || "No specialization"}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Qualification:</strong>{" "}
            {appointment.doctor_id?.qualification || "Not specified"}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Time:</strong>{" "}
            {appointment.slot_id
              ? `${formatTimeString(
                  appointment.slot_id.startTime
                )} - ${formatTimeString(appointment.slot_id.endTime)}`
              : "Time slot not specified"}
          </p>
          <p className="text-sm mt-1">
            <strong>Status:</strong>{" "}
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(
                appointment.status
              )}`}
            >
              {appointment.status || "Unknown"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex flex-col gap-3 items-center md:items-end">
        {appointment.status.toLowerCase() === "completed" ? (
          <>
            <button
              onClick={handleViewDetails}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              active:scale-95 
              transition-all duration-200"
              aria-label="View appointment details"
            >
              <FaInfoCircle className="text-blue-600 w-5 h-5" />
              <span>View Details</span>
            </button>
            {showViewDetails && (
              <ViewDetails
                appointment={appointment}
                onClose={handleCloseViewDetails}
              />
            )}
            <Link
              to={`/prescription/${appointment._id}`}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-100 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
        active:scale-95 
        transition-all duration-200"
              aria-label="View prescription"
            >
              <ClipboardList className="text-indigo-600 w-5 h-5" />
              <span>Prescription</span>
            </Link>
            <button
              onClick={handleAddOrEditReview}
              disabled={isCheckingReview}
              className={`flex items-center gap-2 border ${
                existingReview
                  ? "border-yellow-500 text-yellow-600"
                  : "border-green-600 text-green-600"
              } px-4 py-2 rounded-md hover:bg-green-100 transition ${
                isCheckingReview ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaStar />
              {isCheckingReview
                ? "Checking..."
                : existingReview
                ? "Edit Review"
                : "Add Review"}
            </button>
            {showReviewForm && (
              <ReviewForm
                doctorId={appointment.doctor_id._id}
                doctorName={appointment.doctor_id?.name || "Unknown Doctor"}
                appointmentDate={appointment.appointmentDate}
                appointmentId={appointment._id}
                onClose={handleCloseReviewForm}
                existingReview={existingReview}
              />
            )}
          </>
        ) : appointment.status.toLowerCase() === "confirmed" &&
          appointment.modeOfAppointment.toLowerCase() === "online" &&
          isAppointmentToday(appointment.appointmentDate) ? (
          <>
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Enter Room ID from email"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              />
              <button
                onClick={handleJoinVideoCall}
                className="flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-100 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                active:scale-95 
                transition-all duration-200"
              >
                <FaVideo className="text-purple-600 w-5 h-5" />
                <span>Join Video Call</span>
              </button>
            </div>
            <button
              onClick={handleCancel}
              disabled={isCanceling}
              className={`flex items-center gap-2 border border-red-600 text-red-600 px-4 py-2 rounded-md transition ${
                isCanceling
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-100"
              }`}
            >
              <FaTrashAlt />
              {isCanceling ? "Canceling..." : "Cancel Appointment"}
            </button>
          </>
        ) : appointment.status.toLowerCase() === "confirmed" &&
          appointment.modeOfAppointment.toLowerCase() === "online" ? (
          <div className="text-sm text-gray-500 italic">
            Video call will be available on{" "}
            {formatDate(appointment.appointmentDate)}
          </div>
        ) : appointment.status.toLowerCase() !== "failed" && (
          <button
            onClick={handleCancel}
            disabled={
              isCanceling || appointment.status.toLowerCase() === "canceled"
            }
            className={`flex items-center gap-2 border border-red-600 text-red-600 px-4 py-2 rounded-md transition ${
              isCanceling || appointment.status.toLowerCase() === "canceled"
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-100"
            }`}
          >
            <FaTrashAlt />
            {isCanceling ? "Canceling..." : "Cancel Appointment"}
          </button>
        )}
      </div>

      <CancelConfirmationModal
        isOpen={showCancelModal}
        onConfirm={handleConfirmCancel}
        onClose={handleCloseModal}
        message={`Are You Sure you want to cancel the booking?`}
      />
    </div>
  );
};

export default AppointmentCard;
