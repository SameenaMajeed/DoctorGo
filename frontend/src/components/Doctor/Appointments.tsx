"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { IAppointment } from "../../Types"
import toast from "react-hot-toast"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Clock,
  Stethoscope,
  FileText,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchDoctorAppointments, updateAppointmentStatus } from "../../Api/DoctorApis"
import { useSelector } from "react-redux"
import type { RootState } from "../../slice/Store/Store"
import { createApiInstance } from "../../axios/apiService"
// import doctorApi from "../../axios/DoctorInstance"

const doctorApi = createApiInstance("doctor");

const Appointments: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(6)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const statusConfig = {
    pending: {
      color: "bg-gradient-to-r from-amber-400 to-orange-500",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50",
      icon: AlertCircle,
      label: "Pending Review",
    },
    confirmed: {
      color: "bg-gradient-to-r from-emerald-400 to-teal-500",
      textColor: "text-emerald-800",
      bgColor: "bg-emerald-50",
      icon: CheckCircle,
      label: "Confirmed",
    },
    completed: {
      color: "bg-gradient-to-r from-blue-400 to-indigo-500",
      textColor: "text-blue-800",
      bgColor: "bg-blue-50",
      icon: CheckCircle,
      label: "Completed",
    },
    cancelled: {
      color: "bg-gradient-to-r from-rose-400 to-red-500",
      textColor: "text-rose-800",
      bgColor: "bg-rose-50",
      icon: XCircle,
      label: "Cancelled",
    },
  }

  const token = useSelector((state: RootState) => state.doctor.doctor?.accessToken)

  const loadAppointments = async () => {
    if (!doctorId) {
      toast.error("Doctor ID is missing")
      return
    }
    setLoading(true)
    const { success, message, appointments, totalPages } = await fetchDoctorAppointments({
      doctorId,
      page,
      limit,
      statusFilter,
    })
    if (success) {
      setAppointments(appointments || [])
      setTotalPages(totalPages || 1)
    } else {
      toast.error(message)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAppointments()
  }, [doctorId, page, limit, statusFilter])

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    const { success, message, shouldRefresh } = await updateAppointmentStatus({
      appointmentId,
      status,
    })
    if (success) {
      toast.success(message)
      if (shouldRefresh) {
        loadAppointments()
      }
    } else {
      toast.error(message)
    }
  }

  const handleAddPrescription = (appointment: IAppointment) => {
    const patient = typeof appointment.user_id === "object" ? appointment.user_id : null
    if (!patient) {
      toast.error("Patient information is missing")
      return
    }
    navigate(`/doctor/newRecords`, {
      state: { patient, appointment },
    })
  }

  const handleCreateVideoCall = async (appointment: IAppointment) => {
    if (appointment.status !== "confirmed" || appointment.modeOfAppointment !== "online") {
      toast.error("Video calls can only be started for confirmed online appointments")
      return
    }
    try {
      if (!token) {
        toast.error("Authentication token missing. Please log in again.")
        return
      }
      const response = await doctorApi.post(
        "/create-video-call-room",
        { bookingId: appointment._id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const data = response.data.data
      if (data) {
        toast.success("Video call room created successfully")
        navigate(`/doctor/video-call?roomId=${data.roomId}&bookingId=${appointment._id}`)
      } else {
        toast.error(data.message || "Failed to create video call room")
      }
    } catch (error) {
      console.error("Error creating video call room:", error)
      toast.error("An error occurred while creating the video call room")
    }
  }

  const filteredAppointments = appointments.filter((appointment) =>
    typeof appointment.user_id === "object"
      ? appointment.user_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patientDetails.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      : appointment.patientDetails.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusCounts = () => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                Appointment Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Manage current and upcoming appointments with real-time status
               updates, patient information, and video call initiation.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </motion.div>

              {Object.entries(statusConfig).map(([status, config]) => (
                <motion.div
                  key={status}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statusCounts[status as keyof typeof statusCounts]}
                      </p>
                    </div>
                    <config.icon className={`w-6 h-6 ${config.textColor}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>

                <select
                  onChange={(e) => {
                    setStatusFilter(e.target.value === "all" ? undefined : e.target.value)
                    setPage(1)
                  }}
                  className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Pagination */}
                <div className="flex items-center gap-2 bg-white/50 rounded-xl p-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Section */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Loading appointments...</p>
              </motion.div>
            ) : filteredAppointments.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CalendarDays className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredAppointments.map((appointment, index) => {
                  const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig]
                  const StatusIcon = statusInfo?.icon || AlertCircle

                  return (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Status Bar */}
                      <div className={`h-1 ${statusInfo?.color || "bg-gray-300"}`} />

                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                              {typeof appointment.user_id === "object" ? appointment.user_id.name : "Unknown User"}
                            </h3>
                            <p className="text-gray-600 text-sm">{appointment.patientDetails.patientName}</p>
                          </div>
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo?.bgColor || "bg-gray-100"}`}
                          >
                            <StatusIcon className={`w-4 h-4 ${statusInfo?.textColor || "text-gray-600"}`} />
                            <span className={`text-sm font-medium ${statusInfo?.textColor || "text-gray-600"}`}>
                              {statusInfo?.label || appointment.status}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <CalendarDays className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">
                              {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium">{appointment.appointmentTime}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                              <Stethoscope className="w-4 h-4 text-purple-600" />
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                appointment.modeOfAppointment === "online"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {appointment.modeOfAppointment === "online" ? "🎥 Online" : "🏥 In-person"}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {appointment.status === "pending" && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirm
                              </button>
                            </div>
                          )}

                          {appointment.status === "confirmed" && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(appointment._id, "completed")}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Complete
                                </button>
                              </div>

                              <button
                                onClick={() => handleAddPrescription(appointment)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                Add Prescription
                              </button>

                              {appointment.modeOfAppointment === "online" && (
                                <button
                                  onClick={() => handleCreateVideoCall(appointment)}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all shadow-lg hover:shadow-xl"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  Start Video Call
                                </button>
                              )}
                            </div>
                          )}

                          {appointment.status === "completed" && (
                            <button
                              onClick={() => handleAddPrescription(appointment)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View/Edit Prescription
                            </button>
                          )}

                          {appointment.status === "cancelled" && (
                            <div className="text-center py-4">
                              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-800 bg-rose-100 rounded-full">
                                <XCircle className="w-4 h-4" />
                                Appointment Cancelled
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Appointments


// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { IAppointment } from "../../Types";
// import toast from "react-hot-toast";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Loader2,
//   CalendarDays,
//   Clock,
//   Users,
//   Stethoscope,
//   FileText,
//   Video,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import {
//   fetchDoctorAppointments,
//   updateAppointmentStatus,
// } from "../../Api/DoctorApis";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import doctorApi from "../../axios/DoctorInstance";

// const Appointments: React.FC = () => {
//   const { doctorId } = useParams<{ doctorId: string }>();
//   console.log("Extracted Doctor ID:", doctorId);
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState<IAppointment[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(6);
//   const [totalPages, setTotalPages] = useState(1);
//   const [statusFilter, setStatusFilter] = useState<string | undefined>(
//     undefined
//   );

//   const params = useParams();
//   console.log("Params Object:", params);

//   const statusStyles: { [key: string]: string } = {
//     pending: "bg-amber-100 text-amber-800",
//     confirmed: "bg-emerald-100 text-emerald-800",
//     completed: "bg-blue-100 text-blue-800",
//     cancelled: "bg-rose-100 text-rose-800",
//   };

//   const loadAppointments = async () => {
//     if (!doctorId) {
//       toast.error("Doctor ID is missing");
//       return;
//     }

//     setLoading(true);

//     const { success, message, appointments, totalPages } =
//       await fetchDoctorAppointments({
//         doctorId,
//         page,
//         limit,
//         statusFilter,
//       });

//     if (success) {
//       console.log("Fetched appointments:", appointments);
//       setAppointments(appointments || []);
//       setTotalPages(totalPages || 1);
//     } else {
//       toast.error(message);
//     }

//     setLoading(false);
//   };

//   useEffect(() => {
//     loadAppointments();
//   }, [doctorId, page, limit, statusFilter]);

//   const handleStatusUpdate = async (appointmentId: string, status: string) => {
//     console.log("Updating appointment:", appointmentId);

//     const { success, message, shouldRefresh } = await updateAppointmentStatus({
//       appointmentId,
//       status,
//     });

//     if (success) {
//       toast.success(message);
//       if (shouldRefresh) {
//         loadAppointments();
//       }
//     } else {
//       toast.error(message);
//     }
//   };

//   const handleAddPrescription = (appointment: IAppointment) => {
//     const patient =
//       typeof appointment.user_id === "object" ? appointment.user_id : null;
//     console.log("patient:", patient);
//     if (!patient) {
//       toast.error("Patient information is missing");
//       return;
//     }
//     navigate(`/doctor/newRecords`, {
//       state: {
//         patient,
//         appointment,
//       },
//     });
//   };

//   const token = useSelector(
//     (state: RootState) => state.doctor.doctor?.accessToken
//   );

//   const handleCreateVideoCall = async (appointment: IAppointment) => {
//     if (
//       appointment.status !== "confirmed" ||
//       appointment.modeOfAppointment !== "online"
//     ) {
//       toast.error(
//         "Video calls can only be started for confirmed online appointments"
//       );
//       return;
//     }

//     try {
//       if (!token) {
//         toast.error("Authentication token missing. Please log in again.");
//         return;
//       }

//       const response = await doctorApi.post(
//         "/create-video-call-room",
//         { bookingId: appointment._id },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = response.data.data;
//       console.log('data:' ,data )

//       if (data) {
//         toast.success("Video call room created successfully");
//         navigate(
//           `/doctor/video-call?roomId=${data.roomId}&bookingId=${appointment._id}`
//         );
//       } else {
//         toast.error(data.message || "Failed to create video call room");
//       }
//     } catch (error) {
//       console.error("Error creating video call room:", error);
//       toast.error("An error occurred while creating the video call room");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-12 text-center">
//           <h1 className="text-3xl font-bold text-gray-900 font-playfair mb-2">
//             Appointment Management
//           </h1>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Manage current and upcoming appointments with real-time status
//             updates, patient information, and video call initiation.
//           </p>
//         </div>

//         {/* Controls Section */}
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
//           <select
//             onChange={(e) => {
//               setStatusFilter(
//                 e.target.value === "all" ? undefined : e.target.value
//               );
//               setPage(1);
//             }}
//             className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//           >
//             <option value="all">All Appointments</option>
//             <option value="pending">Pending</option>
//             <option value="confirmed">Confirmed</option>
//             <option value="completed">Completed</option>
//             <option value="cancelled">Cancelled</option>
//           </select>

//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage(Math.max(1, page - 1))}
//               disabled={page === 1}
//               className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </button>
//             <button
//               onClick={() => setPage(Math.min(totalPages, page + 1))}
//               disabled={page === totalPages}
//               className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Content Section */}
//         {loading ? (
//           <div className="flex justify-center py-12">
//             <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
//           </div>
//         ) : appointments.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             No Appointments found matching your criteria
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {appointments.map((appointment) => (
//               <motion.div
//                 key={appointment._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
//               >
//                 <div className="p-6">
//                   {/* Guest Info */}
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="font-semibold text-gray-900">
//                       {typeof appointment.user_id === "object"
//                         ? appointment.user_id.name
//                         : "Unknown User"}
//                     </h3>
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm ${
//                         statusStyles[appointment.status]
//                       }`}
//                     >
//                       {appointment.status}
//                     </span>
//                   </div>

//                   {/* Details Grid */}
//                   <div className="space-y-3 text-sm text-gray-600">
//                     <div className="flex items-center gap-2">
//                       <CalendarDays className="w-4 h-4 text-gray-400" />
//                       {new Date(
//                         appointment.appointmentDate
//                       ).toLocaleDateString()}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4 text-gray-400" />
//                       {appointment.appointmentTime}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Users className="w-4 h-4 text-gray-400" />
//                       {appointment.patientDetails.patientName}
//                     </div>
//                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium shadow-sm">
//                       <Stethoscope className="w-4 h-4 text-blue-600" />
//                       {appointment.modeOfAppointment}
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="mt-6 flex flex-wrap gap-2">
//                     {appointment.status === "pending" && (
//                       <>
//                         <button
//                           onClick={() =>
//                             handleStatusUpdate(appointment._id, "cancelled")
//                           }
//                           className="flex-1 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           onClick={() =>
//                             handleStatusUpdate(appointment._id, "confirmed")
//                           }
//                           className="flex-1 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
//                         >
//                           Confirm
//                         </button>
//                       </>
//                     )}
//                     {appointment.status === "confirmed" && (
//                       <>
//                         <button
//                           onClick={() =>
//                             handleStatusUpdate(appointment._id, "cancelled")
//                           }
//                           className="flex-1 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           onClick={() =>
//                             handleStatusUpdate(appointment._id, "completed")
//                           }
//                           className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
//                         >
//                           Complete
//                         </button>
//                         <button
//                           onClick={() => handleAddPrescription(appointment)}
//                           className="flex-1 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
//                         >
//                           <FileText className="w-4 h-4 inline-block mr-1" />
//                           Add Prescription
//                         </button>
//                         {appointment.modeOfAppointment === "online" && (
//                           <button
//                             onClick={() => handleCreateVideoCall(appointment)}
//                             className="flex-1 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
//                           >
//                             <Video className="w-4 h-4 inline-block mr-1" />
//                             Start Video Call
//                           </button>
//                         )}
//                       </>
//                     )}
//                     {appointment.status === "completed" && (
//                       <button
//                         onClick={() => handleAddPrescription(appointment)}
//                         className="flex-1 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
//                       >
//                         <FileText className="w-4 h-4 inline-block mr-1" />
//                         Add Prescription
//                       </button>
//                     )}
//                     {appointment.status === "cancelled" && (
//                       <span className="px-3 py-1 text-sm font-medium text-rose-800 bg-rose-100 rounded-full">
//                         Cancelled
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Appointments;
