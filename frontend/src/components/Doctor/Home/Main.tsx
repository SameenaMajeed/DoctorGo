import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../slice/Store/Store";
import DashboardStats from "./DashboardStats";
import { useTodaysAppointments } from "../../../Hooks/useTodaysAppointments";

interface MainProps {
  onRestrictedAction?: () => void;
}

const Main: React.FC<MainProps> = ({ onRestrictedAction }) => {
  const { doctor } = useSelector((state: RootState) => state.doctor);
  const navigate = useNavigate();
  const { appointments, loading, error } = useTodaysAppointments();
  console.log("Appointments", appointments);

  // // Function to restrict access to non-approved doctors
  // const handleRestrictedNavigation = (e: React.MouseEvent, path: string) => {
  //   if (!doctor?.isApproved) {
  //     e.preventDefault(); // Prevent navigation
  //     toast.error("Your account is pending approval.");
  //     navigate("/doctor/pending-approval");
  //   }
  // };

  console.log("Main is rendering");

  return (
    <div className="p-6 md:p-10">
      <main className="bg-white shadow-lg rounded-xl p-8 md:p-12 transition-all">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome to Your Dashboard
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Manage your{" "}
          <span className="text-green-600 font-semibold">appointments</span>,{" "}
          <span className="text-green-600 font-semibold">patients</span>, and{" "}
          <span className="text-green-600 font-semibold">schedule</span>{" "}
          efficiently.
        </p>

        {/* Quick Actions*/}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/doctor/${doctor?._id}/appointments`)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            View Appointments
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>

          {appointments.length === 0 ? (
            <p>No appointments scheduled for today</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white border rounded-xl shadow p-4"
                >
                  {/* Patient Name and Status */}
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-lg">
                      {appointment.patientDetails.patientName}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* Date and Time */}
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <span className="mr-2">📅</span>
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="mr-2">⏰</span>
                    {appointment.appointmentTime}
                  </div>

                  {/* Patient Info */}
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="mr-2">👤</span>
                    {appointment.patientDetails.patientName || "Not specified"}
                  </div>

                  {/* Status Indicator (e.g., online) */}
                  <div className="mb-2">
                    <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                      🩺 Online
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm">
                      Cancel
                    </button>
                    <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 text-sm">
                      Complete
                    </button>
                    <button className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-200 text-sm">
                      Add Prescription
                    </button>
                    <button className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded mt-2 text-sm flex items-center justify-center hover:bg-purple-200">
                      <span className="mr-2">📹</span> Start Video Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard Statistics */}
        <DashboardStats />
      </main>
    </div>
  );
};

export default Main;
