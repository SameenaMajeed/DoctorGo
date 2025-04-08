import React, { useState } from "react";
import { toast } from "react-toastify";
import { Appointment } from "../../Types";
import api from "../../axios/UserInstance";
import "react-toastify/dist/ReactToastify.css";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onCancel }) => {
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancel = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    setIsCanceling(true);
    const toastId = toast.loading("Cancelling appointment...");

    try {
      const response = await api.patch(`/appointments/${appointment._id}/cancel`);
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

  const formatTimeString = (timeString: string) => {
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
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

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex items-center">
          <img
            src={appointment.doctor_id.profilePicture || "https://via.placeholder.com/80"}
            alt={appointment.doctor_id.name}
            className="w-20 h-20 rounded-full mr-4"
          />
          <div>
            <h2 className="text-lg font-semibold">{appointment.doctor_id.name}</h2>
            <p className="text-gray-500">{appointment.doctor_id.specialization}</p>
            <p className="text-gray-600">
              <strong>Qualification:</strong> {appointment.doctor_id.qualification}
            </p>
            <div>
              <p className="text-gray-600">
                <strong>Date:</strong>{" "}
                {new Date(appointment.appointmentDate).toISOString().split("T")[0]}
              </p>
              <p className="text-gray-600">
                <strong>Time:</strong>{" "}
                {formatTimeString(appointment.slot_id.startTime)} -{" "}
                {formatTimeString(appointment.slot_id.endTime)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleCancel}
            className={`ml-2 border border-red-500 text-red-500 px-4 py-2 rounded-lg ${isCanceling ? "opacity-50" : ""}`}
            disabled={isCanceling}
          >
            {isCanceling ? "Canceling..." : "Cancel appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
