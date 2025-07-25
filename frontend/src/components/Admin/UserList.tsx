"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { fetchUser, blockUser } from "../../Api/AdminApis"
import useFetchData from "../../Hooks/useFetchData"
import Loader from "./Loader"
import DataTable from "./DataTable"
import TableActions from "./TableActions"
import Pagination from "../../Pagination/Pagination"
import { toast } from "react-hot-toast"
import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal"
import { Search, Users, Filter } from "lucide-react"
import ErrorDisplay from "./Home/ErrorDisplay"
// import { createApiInstance } from "../../axios/apiService"


const UserList: React.FC = () => {
  const [page, setPage] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isBlockedFilter, setIsBlockedFilter] = useState<string>("all")
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null)
  const [showBlocking, setShowBlocking] = useState(false)

  const limit = 4

  const fetchUserCallback = useCallback(
    () => fetchUser(page, limit, searchTerm, isBlockedFilter),
    [page, searchTerm, isBlockedFilter],
  )

  const { data, loading, error, refetch } = useFetchData(fetchUserCallback)

  const users = data?.users || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleBlockUser = async (userId: string, _isBlocked: boolean) => {
    setBlockingUserId(userId)
    setShowBlocking(true)
  }

  const confirmBlockUser = async () => {
    if (!blockingUserId) return
    const action = users.find((u: any) => u._id === blockingUserId)?.isBlocked ? "Unblock" : "Block"

    const toastId = toast.loading(`Are you sure you want to ${action.toLowerCase()} this user?`)

    try {
      await blockUser(blockingUserId, !users.find((u: any) => u._id === blockingUserId)?.isBlocked)
      toast.success(`User has been ${action.toLowerCase()}ed successfully.`, { id: toastId })
      refetch()
    } catch (err) {
      console.error("Error blocking/unblocking user:", err)
      toast.error("Something went wrong. Please try again.", { id: toastId })
    } finally {
      setShowBlocking(false)
      setBlockingUserId(null)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart()
    setSearchTerm(value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleCloseModal = () => {
    setShowBlocking(false)
    setBlockingUserId(null)
  }

  if (loading) return <Loader />

  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* <div className="w-64 flex-shrink-0">
        <AdminSidebar />
      </div> */}

      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            </div>
            <p className="text-gray-600">Manage and monitor user accounts across your platform</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{users.filter((u: any) => !u.isBlocked).length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                  <p className="text-2xl font-bold text-red-600">{users.filter((u: any) => u.isBlocked).length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <div className="w-6 h-6 bg-red-600 rounded-full"></div>
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
                    onChange={(e) => {
                      setIsBlockedFilter(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white min-w-[160px] appearance-none cursor-pointer"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Only</option>
                    <option value="blocked">Blocked Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-hidden">
              {users.length > 0 ? (
                <DataTable
                  columns={["name", "email"]}
                  data={users}
                  actions={(user) => (
                    <TableActions
                      
                      onBlock={() => handleBlockUser(user._id, !user.isBlocked)}
                      isBlocked={user.isBlocked}
                      // onViewDetails={() => {}}
                      verificationStatus=""
                    />
                  )}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">
                    {searchTerm || isBlockedFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No users have been registered yet"}
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
          users.find((u: any) => u._id === blockingUserId)?.isBlocked ? "unblock" : "block"
        } this user?`}
      />
    </div>
  )
}

export default UserList





// import React, { useCallback, useState } from "react";
// import { fetchUser, blockUser } from "../../Api/AdminApis";
// import useFetchData from "../../Hooks/useFetchData";
// import Loader from "./Loader";
// import DataTable from "./DataTable";
// import TableActions from "./TableActions";
// import Pagination from "../../Pagination/Pagination";
// import AdminSidebar from "./Home/AdminSidebar";
// import { toast } from "react-hot-toast";
// import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal";

// const UserList: React.FC = () => {
//   const [page, setPage] = useState<number>(1);
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [isBlockedFilter, setIsBlockedFilter] = useState<string>("all");
//   const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
//   const [showBlocking, setShowBlocking] = useState(false);

//   const limit = 4;

//   const fetchUserCallback = useCallback(
//     () => fetchUser(page, limit, searchTerm, isBlockedFilter),
//     [page, searchTerm, isBlockedFilter]
//   );

//   const { data, loading, error, refetch } = useFetchData(fetchUserCallback);

//   const users = data?.users || [];
//   const total = data?.total || 0;
//   const totalPages = Math.ceil(total / limit);

//   const handleBlockUser = async (userId: string, _isBlocked: boolean) => {
//     setBlockingUserId(userId);
//     setShowBlocking(true);
//   };

//   const confirmBlockUser = async () => {
//     if (!blockingUserId) return;

//     const action = users.find((u :any) => u._id === blockingUserId)?.isBlocked
//       ? "Unblock"
//       : "Block";
    
//     const toastId = toast.loading(`Are you sure you want to ${action.toLowerCase()} this user?`);
    
//     try {
//       await blockUser(blockingUserId, !users.find((u :any) => u._id === blockingUserId)?.isBlocked);
//       toast.success(`User has been ${action.toLowerCase()}ed successfully.`, { id: toastId });
//       refetch();
//     } catch (err) {
//       console.error("Error blocking/unblocking user:", err);
//       toast.error("Something went wrong. Please try again.", { id: toastId });
//     } finally {
//       setShowBlocking(false);
//       setBlockingUserId(null);
//     }
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.trimStart();
//     setSearchTerm(value);
//     setPage(1);
//   };

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPage(newPage);
//     }
//   };

//   const handleCloseModal = () => {
//     setShowBlocking(false);
//     setBlockingUserId(null);
//   };

//   if (loading) return <Loader />;
//   if (error)
//     return (
//       <div className="text-red-500 text-center mt-8 font-medium">
//         Error: {error}
//       </div>
//     );

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <div className="w-64">
//         <AdminSidebar />
//       </div>
//       <div className="flex-1 p-6">
//         <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
//             User List
//           </h2>

//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
//             <input
//               type="text"
//               placeholder="Search by name or email..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//               className="w-full sm:w-80 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//             <select
//               value={isBlockedFilter}
//               onChange={(e) => {
//                 setIsBlockedFilter(e.target.value);
//                 setPage(1);
//               }}
//               className="w-full sm:w-48 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="all">All</option>
//               <option value="active">Active</option>
//               <option value="blocked">Blocked</option>
//             </select>
//           </div>

//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <DataTable
//               columns={["name", "email"]}
//               data={users}
//               actions={(user) => (
//                 <TableActions
//                   onBlock={() => handleBlockUser(user._id, !user.isBlocked)}
//                   isBlocked={user.isBlocked}
//                   onApprove={() => {}}
//                   verificationStatus=""
//                 />
//               )}
//             />
//           </div>

//           <CancelConfirmationModal
//             isOpen={showBlocking}
//             onConfirm={confirmBlockUser}
//             onClose={handleCloseModal}
//             message={`Are you sure you want to ${
//               users.find((u:any) => u._id === blockingUserId)?.isBlocked ? "unblock" : "block"
//             } this user?`}
//           />

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

// export default UserList;
