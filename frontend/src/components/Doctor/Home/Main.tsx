"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../../slice/Store/Store"
import { Calendar, Users, Clock, Eye, MessageCircle, Phone, Video, MapPin, Stethoscope } from "lucide-react"
import { useTodaysAppointments } from "../../../Hooks/useTodaysAppointments"
// import doctorApi from "../../../axios/DoctorInstance"
import { setProfile } from "../../../slice/Doctor/doctorSlice"
import toast from "react-hot-toast"
import DashboardStats from "./DashboardStats"
import { createApiInstance } from "../../../axios/apiService"

interface MainProps {
  onRestrictedAction?: () => void
}

const doctorApi = createApiInstance("doctor");

const Main: React.FC<MainProps> = () => {
  const { doctor } = useSelector((state: RootState) => state.doctor)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { appointments, loading} = useTodaysAppointments()
  const [onlineStatus, setOnlineStatus] = useState<boolean>(false)

  useEffect(() => {
    if (doctor?.isOnline !== undefined) {
      setOnlineStatus(doctor.isOnline)
    }
  }, [doctor?.isOnline])

  const handleStatusToggle = async () => {
    try {
      const toggledStatus = !onlineStatus
      const response = await doctorApi.put(`/${doctor?._id}/status`, {
        isOnline: toggledStatus,
      })
      const updatedDoctor = response.data.data.result
      dispatch(setProfile(updatedDoctor))
      setOnlineStatus(updatedDoctor.isOnline)
      toast.success(`You are now ${updatedDoctor.isOnline ? "Online" : "Offline"}`)
    } catch (error) {
      console.error("Failed to toggle status:", error)
      toast.error("Failed to update status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const quickActions = [
    {
      title: "View Appointments",
      description: "Manage your daily schedule",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      action: () => navigate(`/doctor/${doctor?._id}/appointments`),
    },
    {
      title: "Patient Records",
      description: "Access medical histories",
      icon: Users,
      color: "from-green-500 to-green-600",
      action: () => navigate(`/doctor/${doctor?._id}/patients`),
    },
    {
      title: "Messages",
      description: "Chat with patients",
      icon: MessageCircle,
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/myChats"),
    },
    {
      title: "Create Slot",
      description: "Add new time slots",
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      action: () => navigate("/doctor/slots/create"),
    },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, Dr. {doctor?.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">Ready to make a difference in your patients' lives today?</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${onlineStatus ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm font-medium text-gray-700">Status: {onlineStatus ? "Online" : "Offline"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{doctor?.specialization}</span>
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200"
          >
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Availability Status</p>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-4 h-4 rounded-full ${onlineStatus ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-semibold ${onlineStatus ? "text-green-600" : "text-red-600"}`}>
                  {onlineStatus ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
            <button
              onClick={handleStatusToggle}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                onlineStatus
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              }`}
            >
              {onlineStatus ? "Go Offline" : "Go Online"}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-blue-500 transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Today's Appointments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Today's Appointments</h2>
              <p className="text-blue-100">Manage your daily patient schedule</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{appointments.length}</div>
                <div className="text-sm text-blue-100">Total</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="ml-3 text-gray-600">Loading appointments...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments today</h3>
              <p className="text-gray-600">Enjoy your free day or create new time slots for patients.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {appointment.patientDetails.patientName}
                          </h3>
                          <p className="text-sm text-gray-500">Patient</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          appointment.status,
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <span>{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          {appointment.modeOfAppointment === "online" ? (
                            <Video className="w-4 h-4 text-purple-600" />
                          ) : (
                            <MapPin className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.modeOfAppointment === "online"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {appointment.modeOfAppointment === "online" ? "Online" : "In-person"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <button className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      {appointment.modeOfAppointment === "online" && (
                        <button className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors">
                          <Video className="w-4 h-4" />
                        </button>
                      )}
                      <button className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Dashboard Statistics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <DashboardStats />
      </motion.div>
    </div>
  )
}

export default Main



// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { RootState } from "../../../slice/Store/Store";
// import DashboardStats from "./DashboardStats";
// import { useTodaysAppointments } from "../../../Hooks/useTodaysAppointments";
// import doctorApi from "../../../axios/DoctorInstance";
// import { setProfile } from "../../../slice/Doctor/doctorSlice";
// import toast from "react-hot-toast";

// interface MainProps {
//   onRestrictedAction?: () => void;
// }

// const Main: React.FC<MainProps> = ({ onRestrictedAction }) => {
//   const { doctor } = useSelector((state: RootState) => state.doctor);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { appointments, loading, error } = useTodaysAppointments();
//   console.log("Appointments", appointments);
//   const [onlineStatus, setOnlineStatus] = useState<boolean>(false);

//   // // Function to restrict access to non-approved doctors
//   // const handleRestrictedNavigation = (e: React.MouseEvent, path: string) => {
//   //   if (!doctor?.isApproved) {
//   //     e.preventDefault(); // Prevent navigation
//   //     toast.error("Your account is pending approval.");
//   //     navigate("/doctor/pending-approval");
//   //   }
//   // };

//   console.log(doctor?.isOnline);

//   useEffect(() => {
//     if (doctor?.isOnline !== undefined) {
//       setOnlineStatus(doctor.isOnline);
//     }
//   }, [doctor?.isOnline]);

//   const handleStatusToggle = async () => {
//     try {
//       const toggledStatus = !onlineStatus;
//       console.log("Toggling status to:", toggledStatus);
//       const response = await doctorApi.put(`/${doctor?._id}/status`, {
//         isOnline: toggledStatus,
//       });
//       console.log(response.data.data.result);
//       const updatedDoctor = response.data.data.result;

//       dispatch(setProfile(updatedDoctor));
//       setOnlineStatus(updatedDoctor.isOnline);
//       toast.success(
//         `You are now ${updatedDoctor.isOnline ? "Online" : "Offline"}`
//       );
//     } catch (error) {
//       console.error("Failed to toggle status:", error);
//     }
//   };

//   console.log("Main is rendering");

//   return (
//     <div className="p-6 md:p-10">
//       <main className="bg-white shadow-lg rounded-xl p-8 md:p-12 transition-all">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
//           Welcome to Your Dashboard
//         </h1>
//         <p className="mt-3 text-lg text-gray-600">
//           Manage your{" "}
//           <span className="text-green-600 font-semibold">appointments</span>,{" "}
//           <span className="text-green-600 font-semibold">patients</span>, and{" "}
//           <span className="text-green-600 font-semibold">schedule</span>{" "}
//           efficiently.
//         </p>

//         {/* Quick Actions*/}
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* View Appointments Button */}
//           <button
//             onClick={() => navigate(`/doctor/${doctor?._id}/appointments`)}
//             className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
//           >
//             View Appointments
//           </button>

//           {/* Online/Offline Toggle */}
//           <div className="px-6 py-3 bg-blue-200 rounded-lg shadow-md flex flex-col justify-center">
//             <p className="text-sm font-medium text-gray-600 mb-2">
//               Your current status:{" "}
//               <span
//                 className={onlineStatus ? "text-green-600" : "text-red-600"}
//               >
//                 {onlineStatus ? "Online" : "Offline"}
//               </span>
//             </p>
//             <button
//               onClick={handleStatusToggle}
//               className={`w-fit px-4 py-2 rounded-md text-white font-semibold transition ${
//                 onlineStatus
//                   ? "bg-red-500 hover:bg-red-600"
//                   : "bg-green-500 hover:bg-green-600"
//               }`}
//             >
//               {onlineStatus ? "Go Offline" : "Go Online"}
//             </button>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>

//           {appointments.length === 0 ? (
//             <p>No appointments scheduled for today</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {appointments.map((appointment) => (
//                 <div
//                   key={appointment._id}
//                   className="bg-white border rounded-xl shadow p-4"
//                 >
//                   {/* Patient Name and Status */}
//                   <div className="flex justify-between items-center mb-2">
//                     <p className="font-semibold text-lg">
//                       {appointment.patientDetails.patientName}
//                     </p>
//                     <span
//                       className={`text-xs font-medium px-2 py-1 rounded-full ${
//                         appointment.status === "confirmed"
//                           ? "bg-green-100 text-green-700"
//                           : appointment.status === "pending"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {appointment.status}
//                     </span>
//                   </div>

//                   {/* Date and Time */}
//                   <div className="flex items-center text-sm text-gray-600 mb-1">
//                     <span className="mr-2">📅</span>
//                     {new Date(appointment.appointmentDate).toLocaleDateString()}
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600 mb-2">
//                     <span className="mr-2">⏰</span>
//                     {appointment.appointmentTime}
//                   </div>

//                   {/* Patient Info */}
//                   <div className="flex items-center text-sm text-gray-600 mb-2">
//                     <span className="mr-2">👤</span>
//                     {appointment.patientDetails.patientName || "Not specified"}
//                   </div>

//                   {/* Status Indicator (e.g., online) */}
//                   <div className="mb-2">
//                     <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
//                       🩺 Online
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Dashboard Statistics */}
//         <DashboardStats />
//       </main>
//     </div>
//   );
// };

// export default Main;
