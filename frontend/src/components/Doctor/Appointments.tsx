import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Appointment } from "../../Types";
import doctorApi from "../../axios/DoctorInstance";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Clock,
  Users,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";
import { fetchDoctorAppointments, updateAppointmentStatus } from "../../Api/DoctorApis";

const Appointments: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  console.log("Extracted Doctor ID:", doctorId);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  const params = useParams();
  console.log("Params Object:", params);

  const statusStyles: { [key: string]: string } = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-rose-100 text-rose-800",
  };

  const loadAppointments = async () => {
    if (!doctorId) {
      toast.error("Doctor ID is missing");
      return;
    }
  
    setLoading(true);
    
    const { 
      success, 
      message, 
      appointments, 
      totalPages 
    } = await fetchDoctorAppointments({
      doctorId,
      page,
      limit,
      statusFilter
    });
  
    if (success) {
      console.log("Fetched appointments:", appointments); // Debugging line
      setAppointments(appointments || []);
      setTotalPages(totalPages || 1);
    } else {
      toast.error(message);
    }
  
    setLoading(false);
  };
  
  // Call this in useEffect or when needed
  useEffect(() => {
    loadAppointments();
  }, [doctorId, page, limit, statusFilter]);
  

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    console.log("Updating appointment:", appointmentId);
    
    const { success, message, shouldRefresh } = await updateAppointmentStatus({
      appointmentId,
      status
    });
  
    if (success) {
      toast.success(message);
      if (shouldRefresh) {
        loadAppointments(); // Refresh the appointments list
      }
    } else {
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 font-playfair mb-2">
            Appointment Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage current and upcoming appointments with real-time status
            updates and detailed patient information.
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <select
            onChange={(e) => {
              setStatusFilter(
                e.target.value === "all" ? undefined : e.target.value
              );
              setPage(1);
            }}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No Appointmnets found matching your criteria
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => (
              <motion.div
                key={appointment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Guest Info */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {typeof appointment.user_id === "object"
                        ? appointment.user_id.name
                        : "Unknown User"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        statusStyles[appointment.status]
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {appointment.appointmentTime}
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {appointment.patientDetails.name}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium shadow-sm">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                      {appointment.modeOfAppointment}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-2">
                    {appointment.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "cancelled")
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "confirmed")
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                      </>
                    )}

                    {appointment.status === "confirmed" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "cancelled")
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "completed")
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                      </>
                    )}

                    {appointment.status === "cancelled" && (
                      <span className="px-3 py-1 text-sm font-medium text-rose-800 bg-rose-100 rounded-full">
                        Cancelled
                      </span>
                    )}
                  </div>

                  {/* <div className="mt-6 flex gap-2">
                    {["pending", "confirmed"].includes(appointment.status) && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "cancelled")
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        {appointment.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(appointment._id, "confirmed")
                            }
                            className="flex-1 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                      </>
                    )}
                  </div> */}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
