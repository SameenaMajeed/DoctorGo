import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IAppointment } from "../../Types";
// import api from "../../axios/UserInstance";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import ReviewForm from "./ReviewForm";
import { FaInfoCircle, FaStar, FaTrashAlt, FaVideo } from "react-icons/fa";
import ViewDetails from "./ViewDetails";
import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal";
import { ClipboardList } from "lucide-react";
import { createApiInstance } from "../../axios/apiService";

interface IAppointmentCardProps {
  appointment: IAppointment;
  onCancel: (id: string) => void;
  isDoctorView?: boolean;
}

const api = createApiInstance("user");

const AppointmentCard: React.FC<IAppointmentCardProps> = ({
  appointment,
  onCancel,
  isDoctorView = false,
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

  const renderCancelStatus = () => {
    if (appointment.status.toLowerCase() === "cancelled") {
      if (isDoctorView) {
        // For doctor view, show who cancelled
        return (
          <div className="text-sm text-red-600 font-medium">
            You cancelled this appointment
          </div>
        );
      } else {
        // For user view, show "Doctor cancelled"
        return (
          <div className="text-sm text-red-600 font-medium">
            Doctor cancelled this appointment
          </div>
        );
      }
    }
    return null;
  };

  const renderActionButtons = () => {
    // Don't show any action buttons for cancelled appointments
    if (appointment.status.toLowerCase() === "cancelled") {
      return renderCancelStatus();
    }

    // For completed appointments
    if (appointment.status.toLowerCase() === "completed") {
      return (
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
      );
    }

    // For confirmed online appointments on the same day
    if (
      appointment.status.toLowerCase() === "confirmed" &&
      appointment.modeOfAppointment.toLowerCase() === "online" &&
      isAppointmentToday(appointment.appointmentDate)
    ) {
      return (
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
          {!isDoctorView && ( // Only show cancel button for users
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
          )}
        </>
      );
    }

    // For confirmed online appointments not today
    if (
      appointment.status.toLowerCase() === "confirmed" &&
      appointment.modeOfAppointment.toLowerCase() === "online"
    ) {
      return (
        <div className="text-sm text-gray-500 italic">
          Video call will be available on{" "}
          {formatDate(appointment.appointmentDate)}
        </div>
      );
    }

    // For all other active appointments (show cancel button only for users)
    if (appointment.status.toLowerCase() !== "failed") {
      return (
        !isDoctorView && ( // Only show cancel button for users
          <button
            onClick={handleCancel}
            disabled={isCanceling}
            className={`flex items-center gap-2 border border-red-600 text-red-600 px-4 py-2 rounded-md transition ${
              isCanceling ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100"
            }`}
          >
            <FaTrashAlt />
            {isCanceling ? "Canceling..." : "Cancel Appointment"}
          </button>
        )
      );
    }

    return null;
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
        {renderActionButtons()}
      </div>

      {/* <div className="mt-4 md:mt-0 flex flex-col gap-3 items-center md:items-end">
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
      </div> */}

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
