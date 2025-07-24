"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { blockDoctor, fetchDoctor } from "../../Api/AdminApis" // Removed approveDoctor import
import useFetchData from "../../Hooks/useFetchData"
import Loader from "./Loader"
import Pagination from "../../Pagination/Pagination"
import TableActions from "./TableActions"
import DataTable from "./DataTable"
import { toast } from "react-hot-toast"
import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal"
import { Search, Stethoscope, Filter, UserCheck, Shield, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom" 
import ErrorDisplay from "./Home/ErrorDisplay"

const DoctorList: React.FC = () => {
  const navigate = useNavigate() 
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [isBlockedFilter, setIsBlockedFilter] = useState("all")
  const [blockingDoctorId, setBlockingDoctorId] = useState<string | null>(null)
  const [showBlocking, setShowBlocking] = useState(false)

  const limit = 4

  const fetchDoctorCallback = useCallback(
    () => fetchDoctor(page, limit, searchTerm, isBlockedFilter),
    [page, limit, searchTerm, isBlockedFilter],
  )

  const { data, loading, error, refetch } = useFetchData(fetchDoctorCallback)

  const doctors = data?.doctors || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleBlockedDoctors = async (doctorId: string, _isBlocked: boolean) => {
    setBlockingDoctorId(doctorId)
    setShowBlocking(true)
  }

  const confirmBlockUser = async () => {
    if (!blockingDoctorId) return
    const action = doctors.find((u: any) => u._id === blockingDoctorId)?.isBlocked ? "Unblock" : "Block"

    const toastId = toast.loading(`Are you sure you want to ${action.toLowerCase()} this doctor?`)

    try {
      await blockDoctor(blockingDoctorId, !doctors.find((u: any) => u._id === blockingDoctorId)?.isBlocked)
      toast.success(`Doctor has been ${action.toLowerCase()}ed successfully.`, { id: toastId })
      refetch()
    } catch (err) {
      console.error("Error blocking/unblocking doctor:", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setShowBlocking(false)
      setBlockingDoctorId(null)
    }
  }

  // New function to handle viewing doctor details
  const handleViewDoctorDetails = (doctorId: string) => {
    navigate(`/admin/doctorDetails/${doctorId}`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trimStart())
    setPage(1)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsBlockedFilter(e.target.value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleCloseModal = () => {
    setShowBlocking(false)
    setBlockingDoctorId(null)
  }

  // Calculate stats
  const activeDoctors = doctors.filter((d: any) => !d.isBlocked).length
  const blockedDoctors = doctors.filter((d: any) => d.isBlocked).length
  const pendingApprovals = doctors.filter((d: any) => d.verificationStatus === "pending").length
  // const approvedDoctors = doctors.filter((d: any) => d.verificationStatus === "approved").length

  if (loading) return <Loader />

  if (error)  return <ErrorDisplay error={error} />

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
            </div>
            <p className="text-gray-600">Manage doctor registrations, approvals, and account status</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                  <p className="text-2xl font-bold text-green-600">{activeDoctors}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingApprovals}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Doctors</p>
                  <p className="text-2xl font-bold text-red-600">{blockedDoctors}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Search and Filter Section */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={isBlockedFilter}
                    onChange={handleFilterChange}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white min-w-[160px] appearance-none cursor-pointer"
                  >
                    <option value="all">All Doctors</option>
                    <option value="active">Active Only</option>
                    <option value="blocked">Blocked Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-hidden">
              {doctors.length > 0 ? (
                <DataTable
                  columns={["name", "email", "verificationStatus"]}
                  data={doctors}
                  actions={(doctor) => (
                    <TableActions
                      onBlock={() => handleBlockedDoctors(doctor._id, !doctor.isBlocked)}
                      isBlocked={doctor.isBlocked}
                      onViewDetails={() => handleViewDoctorDetails(doctor._id)} 
                      verificationStatus={doctor.verificationStatus}
                    />
                  )}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-500">
                    {searchTerm || isBlockedFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No doctors have been registered yet"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-center">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={showBlocking}
        onConfirm={confirmBlockUser}
        onClose={handleCloseModal}
        message={`Are you sure you want to ${
          doctors.find((u: any) => u._id === blockingDoctorId)?.isBlocked ? "unblock" : "block"
        } this doctor?`}
      />
      {/* Removed the approval modal from here */}
    </div>
  )
}

export default DoctorList

// import React, { useCallback, useState } from "react";
// import {
//   blockDoctor, fetchDoctor, approveDoctor,
//  } from "../../Api/AdminApis";
// import useFetchData from "../../Hooks/useFetchData";
// import Loader from "./Loader";
// import Pagination from "../../Pagination/Pagination";
// import TableActions from "./TableActions";
// import DataTable from "./DataTable";
// import AdminSidebar from "./Home/AdminSidebar";
// import { toast } from "react-hot-toast";
// import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal";

// const DoctorList: React.FC = () => {
//   const [page, setPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isBlockedFilter, setIsBlockedFilter] = useState("all");
//   const [blockingDoctorId, setBlockingDoctorId] = useState<string | null>(null);
//   const [showBlocking, setShowBlocking] = useState(false);
//   const limit = 6;

//   const fetchDoctorCallback = useCallback(
//     () => fetchDoctor(page, limit, searchTerm, isBlockedFilter),
//     [page, limit, searchTerm, isBlockedFilter]
//   );

//   const { data, loading, error, refetch } = useFetchData(fetchDoctorCallback);

//   const doctors = data?.doctors || [];
//   const total = data?.total || 0;
//   const totalPages = Math.ceil(total / limit);

//   const handleBlockedDoctors = async (doctorId: string, _isBlocked: boolean) => {
//     setBlockingDoctorId(doctorId);
//     setShowBlocking(true);
//   }

//   const confirmBlockUser = async () => {
//     if (!blockingDoctorId) return;

//     const action = doctors.find((u :any) => u._id === blockingDoctorId)?.isBlocked
//     ? "Unblock"
//     : "Block";

//     // const action = isBlocked ? "Block" : "Unblock";
//     const toastId = toast.loading(`Are you sure you want to ${action.toLowerCase()} this doctor?`);

//       try {
//         await blockDoctor(blockingDoctorId, !doctors.find((u : any) => u._id === blockingDoctorId)?.isBlocked);
//       toast.success(`Doctor has been ${action.toLowerCase()}ed successfully.`, { id: toastId });
//         refetch();
//       } catch (err) {
//         console.error("Error blocking/unblocking doctor:", err);
//         toast.error("Something went wrong. Please try again.");
//       }
//       finally {
//         setShowBlocking(false);
//         setBlockingDoctorId(null);
//       }
//     }

//   const handleApproveDoctor = async (doctorId: string) => {
//     if (window.confirm("Do you really want to approve this doctor?")) {
//       try {
//         await approveDoctor(doctorId);
//         toast.success("Doctor has been approved successfully.");
//         refetch();
//       } catch (err) {
//         console.error("Error approving doctor:", err);
//         toast.error("Something went wrong. Please try again.");
//       }
//     }
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value.trimStart());
//     setPage(1);
//   };

//   const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setIsBlockedFilter(e.target.value);
//     setPage(1);
//   };

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPage(newPage);
//     }
//   };

//   const handleCloseModal = () => {
//     setShowBlocking(false);
//     setBlockingDoctorId(null);
//   };

//   if (loading) return <Loader />;
//   if (error)
//     return (
//       <div className="text-red-500 text-center font-medium mt-8">
//         Error: {error}
//       </div>
//     );

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64">
//         <AdminSidebar />
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-6">
//         <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//             Doctors List
//           </h2>

//           {/* Search & Filter */}
//           <div className="flex flex-col sm:flex-row gap-4 mb-6">
//             <input
//               type="text"
//               placeholder="Search by name or email"
//               value={searchTerm}
//               onChange={handleSearchChange}
//               className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80"
//             />
//             <select
//               value={isBlockedFilter}
//               onChange={handleFilterChange}
//               className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48"
//             >
//               <option value="all">All</option>
//               <option value="active">Active</option>
//               <option value="blocked">Blocked</option>
//             </select>
//           </div>

//           {/* Data Table */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <DataTable
//               columns={["name", "email", "verificationStatus"]}
//               data={doctors}
//               actions={(doctor) => (
//                 <TableActions
//                   onBlock={() => handleBlockedDoctors(doctor._id, !doctor.isBlocked)}
//                   isBlocked={doctor.isBlocked}
//                   onApprove={() => handleApproveDoctor(doctor._id)}
//                   verificationStatus={doctor.verificationStatus}
//                 />
//               )}
//             />
//           </div>

//           <CancelConfirmationModal
//             isOpen={showBlocking}
//             onConfirm={confirmBlockUser}
//             onClose={handleCloseModal}
//             message={`Are you sure you want to ${
//               doctors.find((u:any) => u._id === blockingDoctorId)?.isBlocked ? "unblock" : "block"
//             } this doctor?`}
//           />

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="mt-6 flex justify-center">
//               <Pagination
//                 currentPage={page}
//                 totalPages={totalPages}
//                 onPageChange={handlePageChange}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorList;
