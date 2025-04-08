import React, { useState, useEffect } from "react";
import AppointmentCard from "./AppointmentCard";
import Navbar from "../User/Home/Navbar";
import Footer from "../CommonComponents/Footer";
import { useNavigate } from "react-router-dom";
import api from "../../axios/UserInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { Appointment } from "../../Types";

const AppointmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = useSelector((state: RootState) => state.user?.user?.id);

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appointments/${userId}`);
      console.log(response)
      if (Array.isArray(response.data.data)) {
        setAppointments(response.data.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.filter((appt) => appt._id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <div className="bg-white shadow-md fixed w-full top-0 z-50">
        <Navbar />
      </div>

      {/* Back Button */}
      <div className="py-6 mt-16 flex items-center px-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
        >
          ← Back
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 container mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">My Appointments</h2>
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          {loading ? (
            <p className="text-gray-500 text-center animate-pulse">Loading appointments...</p>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment._id} appointment={appointment} onCancel={handleCancelAppointment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No appointments found.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppointmentsList;
