import React, { useState } from "react";
import axios from "axios"; // Import Axios for API calls
import { Appointment } from "../../Types";
import api from "../../axios/UserInstance";
import { setError } from "../../slice/user/userSlice";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void; // Callback function to update state
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onCancel }) => {
  const [isCanceling, setIsCanceling] = useState(false); // Loading state

  const handleCancel = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    setIsCanceling(true);
    try {
      const response = await api.patch(`/appointments/${appointment._id}/cancel`);
      if (response.status === 200) {
        onCancel(appointment._id); // Remove the appointment from UI
        alert("Appointment canceled successfully!");
      }
    } catch (error : any) {
      alert("Failed to cancel the appointment. Please try again.");
      console.error(error);
    }
    setIsCanceling(false);
  };

  const formatTimeString = (timeString: string) => {
    // Handle HH:mm format
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // Handle ISO date string format (legacy)
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
          <p className="text-gray-600"><strong>Date :{" "}{new Date(appointment.appointmentDate).toISOString().split("T")[0]} </strong></p>
          <p className="text-gray-600"><strong>Time:{" "}{formatTimeString(appointment.slot_id.startTime)} - {formatTimeString(appointment.slot_id.endTime)}</strong></p>
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
