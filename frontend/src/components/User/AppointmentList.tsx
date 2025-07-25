import React, { useState, useEffect } from "react";
import AppointmentCard from "./AppointmentCard";
// import { useNavigate } from "react-router-dom";
// import api from "../../axios/UserInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { IAppointment } from "../../Types";
import { createApiInstance } from "../../axios/apiService";

const api = createApiInstance("user");


const AppointmentsList: React.FC = () => {
  // const navigate = useNavigate();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const appointmentsPerPage = 3;

  const userId = useSelector((state: RootState) => state.user?.user?.id);

  useEffect(() => {
    if (userId) fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appointments/${userId}`);
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
    setAppointments((prev) => prev.filter((appt) => appt._id !== id));
  };

  // Pagination logic
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 px-6 py-10">
        <h2 className="text-3xl font-extrabold text-blue-400 mb-6 text-center">
          MY APPOINTMENTS
        </h2>

        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
          {loading ? (
            <p className="text-center text-gray-500 animate-pulse">
              Loading appointments...
            </p>
          ) : currentAppointments.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">No appointments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;
