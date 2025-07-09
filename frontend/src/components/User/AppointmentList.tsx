// "use client"

// import React, { useState, useEffect } from "react"
// import AppointmentCard from "./AppointmentCard"
// import { useNavigate } from "react-router-dom"
// import api from "../../axios/UserInstance"
// import { useSelector } from "react-redux"
// import type { RootState } from "../../slice/Store/Store"
// import type { IAppointment } from "../../Types"
// import { Calendar, ChevronLeft, ChevronRight, Loader, CalendarX } from 'lucide-react'

// const AppointmentsList: React.FC = () => {
//   const navigate = useNavigate()
//   const [appointments, setAppointments] = useState<IAppointment[]>([])
//   const [loading, setLoading] = useState<boolean>(true)
//   const [currentPage, setCurrentPage] = useState<number>(1)
//   const appointmentsPerPage = 3
//   const userId = useSelector((state: RootState) => state.user?.user?.id)

//   useEffect(() => {
//     if (userId) fetchAppointments()
//   }, [userId])

//   const fetchAppointments = async () => {
//     try {
//       const response = await api.get(`/appointments/${userId}`)
//       if (Array.isArray(response.data.data)) {
//         setAppointments(response.data.data)
//       } else {
//         setAppointments([])
//       }
//     } catch (error) {
//       console.error("Error fetching appointments:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCancelAppointment = (id: string) => {
//     setAppointments((prev) => prev.filter((appt) => appt._id !== id))
//   }

//   // Pagination logic
//   const indexOfLastAppointment = currentPage * appointmentsPerPage
//   const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage
//   const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment)
//   const totalPages = Math.ceil(appointments.length / appointmentsPerPage)

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/60">
//           <div className="flex flex-col items-center space-y-4">
//             <div className="relative">
//               <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
//                 <Loader className="animate-spin text-blue-600" size={32} />
//               </div>
//               <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
//             </div>
//             <div className="text-center">
//               <h3 className="text-xl font-semibold text-slate-800 mb-1">Loading Appointments</h3>
//               <p className="text-slate-500">Please wait while we fetch your appointments...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
//       <div className="container mx-auto p-6 max-w-6xl">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
//               <Calendar className="text-white" size={24} />
//             </div>
//             My Appointments
//           </h1>
//           <p className="text-slate-600">Manage and track all your medical appointments</p>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
//           {currentAppointments.length > 0 ? (
//             <>
//               {/* Appointments Header */}
//               <div className="p-8 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-slate-600">
//                       Showing {indexOfFirstAppointment + 1}-{Math.min(indexOfLastAppointment, appointments.length)} of{" "}
//                       {appointments.length} appointments
//                     </p>
//                   </div>
//                   <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl">
//                     <Calendar className="text-blue-600" size={16} />
//                     <span className="text-blue-700 font-medium text-sm">Total: {appointments.length}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Appointments List */}
//               <div className="p-8">
//                 <div className="space-y-6">
//                   {currentAppointments.map((appointment, index) => (
//                     <div
//                       key={appointment._id}
//                       className="transform transition-all duration-300 hover:scale-[1.02]"
//                       style={{ animationDelay: `${index * 100}ms` }}
//                     >
//                       <AppointmentCard appointment={appointment} onCancel={handleCancelAppointment} />
//                     </div>
//                   ))}
//                 </div>

//                 {/* Enhanced Pagination */}
//                 {totalPages > 1 && (
//                   <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-slate-200/60">
//                     {/* Previous Button */}
//                     <button
//                       onClick={() => handlePageChange(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                         currentPage === 1
//                           ? "text-slate-400 bg-slate-100 cursor-not-allowed"
//                           : "text-slate-700 bg-white hover:bg-slate-50 hover:shadow-md border border-slate-200 hover:border-slate-300"
//                       }`}
//                     >
//                       <ChevronLeft size={16} />
//                       Previous
//                     </button>

//                     {/* Page Numbers */}
//                     <div className="flex items-center space-x-1">
//                       {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
//                         <button
//                           key={page}
//                           onClick={() => handlePageChange(page)}
//                           className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
//                             currentPage === page
//                               ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
//                               : "text-slate-700 bg-white hover:bg-slate-50 hover:shadow-md border border-slate-200 hover:border-slate-300"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       ))}
//                     </div>

//                     {/* Next Button */}
//                     <button
//                       onClick={() => handlePageChange(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                         currentPage === totalPages
//                           ? "text-slate-400 bg-slate-100 cursor-not-allowed"
//                           : "text-slate-700 bg-white hover:bg-slate-50 hover:shadow-md border border-slate-200 hover:border-slate-300"
//                       }`}
//                     >
//                       Next
//                       <ChevronRight size={16} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             /* Empty State */
//             <div className="p-16 text-center">
//               <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <CalendarX className="text-slate-400" size={32} />
//               </div>
//               <h3 className="text-2xl font-semibold text-slate-800 mb-2">No Appointments Found</h3>
//               <p className="text-slate-500 max-w-md mx-auto mb-6">
//                 You don't have any appointments scheduled yet. Book your first appointment to get started with your
//                 healthcare journey.
//               </p>
//               <button
//                 onClick={() => navigate("/book-appointment")}
//                 className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
//               >
//                 Book Your First Appointment
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AppointmentsList



import React, { useState, useEffect } from "react";
import AppointmentCard from "./AppointmentCard";
// import { useNavigate } from "react-router-dom";
import api from "../../axios/UserInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { IAppointment } from "../../Types";


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
