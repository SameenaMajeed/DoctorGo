"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Eye,
  FileText,
  MoreVertical,
  ChevronDown,
  UserCheck,
  Activity,
  Clock,
  MapPin,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent } from "../CommonComponents/card"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../CommonComponents/dropdownmenu"
import doctorApi from "../../axios/DoctorInstance"
import { useNavigate, useParams } from "react-router-dom"
import type { IAppointment } from "../../Types"
import type { IUser } from "../../types/auth"
import Pagination from "../../Pagination/Pagination"

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { doctorId } = useParams<{ doctorId: string }>()
  const [patients, setPatients] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [gender, setGender] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [date, setDate] = useState(new Date())
  const [page, setPage] = useState(1)
  const limit = 8
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])

  // Mock stats - replace with real data from your API
  const stats = {
    today: 12,
    monthly: 245,
    yearly: 1680,
    todayChange: 8.5,
    monthlyChange: 15.2,
    yearlyChange: 23.1,
  }

  const fetchPatients = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      else setRefreshing(true)

      const response = await doctorApi.get(`/${doctorId}/patients`, {
        params: {
          search: searchTerm,
          gender,
          sort: sortBy,
          date: date.toISOString().split("T")[0],
          page,
          limit,
        },
      })

      const { patients, total } = response.data.data
      setPatients(patients)
      setTotalPatients(total)
      setTotalPages(Math.ceil(total / limit))
    } catch (error) {
      console.error("Failed to fetch patients", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [doctorId, searchTerm, gender, sortBy, date, page, limit])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRefresh = () => {
    fetchPatients(false)
  }

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId],
    )
  }

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([])
    } else {
      setSelectedPatients(patients.map((p) => p._id))
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, color, bgColor }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
        <div className={`absolute top-0 left-0 w-full h-1 ${bgColor}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <div className="flex items-center space-x-1">
                <TrendingUp className={`w-4 h-4 ${color}`} />
                <span className={`text-sm font-medium ${color}`}>+{change}%</span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div
              className={`p-4 rounded-2xl ${bgColor.replace("bg-gradient-to-r", "bg-opacity-10")} group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading patient data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Patient Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive patient management with real-time insights and analytics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Today's Patients"
            value={stats.today}
            change={stats.todayChange}
            icon={UserCheck}
            color="text-blue-600"
            bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            title="Monthly Patients"
            value={stats.monthly}
            change={stats.monthlyChange}
            icon={Activity}
            color="text-purple-600"
            bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          <StatCard
            title="Yearly Patients"
            value={stats.yearly}
            change={stats.yearlyChange}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-gradient-to-r from-green-500 to-green-600"
          />
        </div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>



              {selectedPatients.length > 0 && (
                <button className="flex items-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors">
                  <FileText className="w-5 h-5" />
                  Bulk Actions ({selectedPatients.length})
                </button>
              )}
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sort by...</option>
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="age">Age</option>
                  </select>

                  <input
                    type="date"
                    value={date.toISOString().split("T")[0]}
                    onChange={(e) => setDate(new Date(e.target.value))}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setGender("")
                      setSortBy("")
                      setDate(new Date())
                    }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Patients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden"
        >
          {patients.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedPatients.length === patients.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">Patients ({totalPatients.toLocaleString()})</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalPatients)} of{" "}
                    {totalPatients.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {patients.map((booking, index) => {
                      const user = booking.user_id as IUser
                      const age = (user as any)?.age || "N/A"
                      const mobile_no = (user as any)?.mobile_no || "N/A"
                      const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })

                      return (
                        <motion.tr
                          key={booking._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-blue-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={selectedPatients.includes(booking._id)}
                                onChange={() => handleSelectPatient(booking._id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img
                                    src={user?.profilePicture || "/placeholder.svg?height=48&width=48"}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg"
                                    alt={user?.name ?? "Patient"}
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {user?.name}
                                  </div>
                                  <div className="text-sm text-gray-500">{user?.email}</div>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                {appointmentDate}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-green-500" />
                                {booking.appointmentTime}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-blue-500" />
                                {mobile_no}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-green-500" />
                                {user?.email}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  user?.gender === "Male"
                                    ? "bg-blue-100 text-blue-800"
                                    : user?.gender === "Female"
                                      ? "bg-pink-100 text-pink-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user?.gender}
                              </span>
                              <span className="text-sm text-gray-600">Age: {age}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/doctor/patient-records/${user._id}`, {
                                    state: {
                                      patient: user,
                                      appointment: booking,
                                    },
                                  })
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                              >
                                <Eye className="w-4 h-4" />
                                View Records
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                  <MoreVertical className="w-5 h-5 text-gray-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/doctor/patient-records/${user._id}`, {
                                        state: {
                                          patient: user,
                                          appointment: booking,
                                        },
                                      })
                                    }
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Patient Records
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Patient
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PatientDashboard


// import React, { useEffect, useState } from "react";
// import { Card, CardContent } from "../CommonComponents/card";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "../CommonComponents/dropdownmenu";
// import doctorApi from "../../axios/DoctorInstance";
// import { useNavigate, useParams } from "react-router-dom";
// import { IAppointment } from "../../Types";
// import { IUser } from "../../types/auth";
// import Pagination from "../../Pagination/Pagination";
// import { MoreHorizontal } from "lucide-react";

// const PatientDashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const { doctorId } = useParams<{ doctorId: string }>();

//   const [patients, setPatients] = useState<IAppointment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [gender, setGender] = useState("");
//   const [sortBy, setSortBy] = useState("");
//   const [date, setDate] = useState(new Date());

//   const [page, setPage] = useState(1);
//   const limit = 5;
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalPatients, setTotalPatients] = useState(0);

//   useEffect(() => {
//     const fetchPatients = async () => {
//       try {
//         const response = await doctorApi.get(`/${doctorId}/patients`, {
//           params: {
//             search: searchTerm,
//             gender,
//             sort: sortBy,
//             date: date.toISOString().split("T")[0],
//             page,
//             limit
//           },
//         });
//         console.log("API response:", response.data.data);

//         const { patients, total } = response.data.data;

//         setPatients(patients);
//         setTotalPatients(total);
//         setTotalPages(Math.ceil(total / limit));

//       } catch (error) {
//         console.error("Failed to fetch patients", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPatients();
//   }, [doctorId, searchTerm, gender, sortBy, date, page, limit]);

//   console.log('totalPatients:',totalPatients)

//   const handlePageChange = (newPage: number) => {
//     setPage(newPage);
//   };

//   // const formatDate = (dateString: string) => {
//   //   try {
//   //     const date = new Date(dateString);
//   //     if (isNaN(date.getTime())) return "Invalid Date";
//   //     return date.toLocaleDateString("en-US", {
//   //       year: "numeric",
//   //       month: "long",
//   //       day: "numeric",
//   //     });
//   //   } catch (error) {
//   //     console.error("Error formatting date:", error);
//   //     return "Invalid Date";
//   //   }
//   // };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="p-6 space-y-6">

//       <div className="grid grid-cols-3 gap-6">
//         {/* Today's Patients */}
//         <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-gray-500 text-sm">Today's Patients</div>
//                 <div className="text-2xl font-semibold">10</div>
//               </div>
//               <div className="p-3 rounded-full bg-blue-100 text-blue-600">
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <div className="text-sm text-green-500 mt-2 flex items-center">
//               <svg
//                 className="w-4 h-4 mr-1"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M5 10l7-7m0 0l7 7m-7-7v18"
//                 />
//               </svg>
//               2 more than yesterday
//             </div>
//           </CardContent>
//         </Card>

//         {/* Monthly Patients */}
//         <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-gray-500 text-sm">Monthly Patients</div>
//                 <div className="text-2xl font-semibold">230</div>
//               </div>
//               <div className="p-3 rounded-full bg-purple-100 text-purple-600">
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <div className="text-sm text-green-500 mt-2 flex items-center">
//               <svg
//                 className="w-4 h-4 mr-1"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M5 10l7-7m0 0l7 7m-7-7v18"
//                 />
//               </svg>
//               15% increase from last month
//             </div>
//           </CardContent>
//         </Card>

//         {/* Yearly Patients */}
//         <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-gray-500 text-sm">Yearly Patients</div>
//                 <div className="text-2xl font-semibold">1,500</div>
//               </div>
//               <div className="p-3 rounded-full bg-green-100 text-green-600">
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <div className="text-sm text-green-500 mt-2 flex items-center">
//               <svg
//                 className="w-4 h-4 mr-1"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M5 10l7-7m0 0l7 7m-7-7v18"
//                 />
//               </svg>
//               20% increase from last year
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//       {/* <div className="grid grid-cols-3 gap-6">
//         <Card>
//           <CardContent className="p-4">
//             <div className="text-gray-500 text-sm">Today Patients</div>
//             <div className="text-2xl font-semibold">10</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="text-gray-500 text-sm">Monthly Patients</div>
//             <div className="text-2xl font-semibold">230</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="text-gray-500 text-sm">Yearly Patients</div>
//             <div className="text-2xl font-semibold">1500</div>
//           </CardContent>
//         </Card>
//       </div> */}

//       {/* <div className="flex gap-4 items-center flex-wrap">
//         <TextInput
//           placeholder="Search Patients"
//           className="w-1/3 min-w-[200px]"
//           value={searchTerm}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setSearchTerm(e.target.value)
//           }
//         />

//         <select
//           className="border rounded px-3 py-2 text-sm"
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//         >
//           <option value="">Sort by...</option>
//           <option value="date">Date</option>
//           <option value="name">Name</option>
//         </select>

//         <select
//           className="border rounded px-3 py-2 text-sm"
//           value={gender}
//           onChange={(e) => setGender(e.target.value)}
//         >
//           <option value="">Gender...</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>

//         <div className="flex items-center gap-2 border rounded px-3 py-2">
//           <CalendarIcon className="h-4 w-4" />
//           <span className="text-sm">{format(date, "MM/dd/yyyy")}</span>
//         </div>
//       </div> */}

//       <div className="bg-white rounded-xl shadow">
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-600">
//             <tr>
//               <th className="p-3">Patient</th>
//               <th className="p-3">Appointment Time and Date</th>
//               <th className="p-3">Gender</th>
//               <th className="p-3">Phone Number</th>
//               <th className="p-3">Age</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {patients.map((booking) => {
//               const user = booking.user_id as IUser;
//               const age = (user as any)?.age || "N/A";
//               const mobile_no = (user as any)?.mobile_no || "N/A";
//               const appointmentDate = new Date(booking.appointmentDate)
//                 .toISOString()
//                 .split("T")[0];

//               return (
//                 <tr key={booking._id} className="border-t">
//                   <td className="p-3 flex items-center gap-3">
//                     <img
//                       src={user?.profilePicture ?? ""}
//                       className="w-10 h-10 rounded-full object-cover"
//                       alt={user?.name ?? "Patient"}
//                     />
//                     <div>
//                       <div className="font-medium text-gray-900">
//                         {user?.name}
//                       </div>
//                       <div className="text-gray-500 text-xs">{user?.email}</div>
//                     </div>
//                   </td>
//                   <td className="p-3">
//                     <div>
//                       <div className="text-sm font-light">
//                         Date : {appointmentDate}
//                       </div>
//                       <div className="text-sm font-light">
//                         Time : {booking.appointmentTime}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="p-3">
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         user?.gender === "Male"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-orange-100 text-orange-700"
//                       }`}
//                     >
//                       {user?.gender}
//                     </span>
//                   </td>
//                   <td className="p-3">{mobile_no}</td>
//                   <td className="p-3">{age}</td>
//                   <td className="p-3">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger>
//                         <MoreHorizontal className="w-5 h-5 cursor-pointer" />
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuItem
//                           onClick={() =>
//                             navigate(`/doctor/patient-records/${user._id}`, {
//                               state: {
//                                 patient: user,
//                                 appointment: booking,
//                               },
//                             })
//                           }
//                         >
//                           Patient Records
//                         </DropdownMenuItem>
//                         <DropdownMenuItem>Delete</DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       {totalPages > 1 && (
//         <Pagination
//           currentPage={page}
//           totalPages={totalPages}
//           onPageChange={handlePageChange}
//         />
//       )}
//     </div>
//   );
// };

// export default PatientDashboard;
