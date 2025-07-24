"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";
import adminApi from "../../axios/AdminInstance";
import Pagination from "../../Pagination/Pagination";
import { Table } from "./Home/Table";
import { getStatusColor } from "../../types/StatusCode";
import { IBooking } from "../../Types";
import { AppointmentStatus } from "../../types/paymentTypes";
import BookingDetailModal from "./Home/BookingDetailModal";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );

  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  const fetchBookings = async (
    page: number,
    status?: AppointmentStatus | "all"
  ) => {
    try {
      setLoading(true);
      const response = await adminApi.get(
        `/bookings?page=${page}&limit=5${
          status && status !== "all" ? `&status=${status}` : ""
        }`
      );
      const data = await response.data.data;
      console.log("All Bookings:", data);
      setBookings(data?.bookings || []);
      setTotalPages(data?.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(
      currentPage,
      statusFilter !== "all" ? statusFilter : undefined
    );
  }, [currentPage, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as AppointmentStatus | "all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case AppointmentStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      case AppointmentStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleViewBookingDetails = (booking: IBooking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const columns = [
    {
      header: "Doctor",
      accessor: "doctor_id.name",
      render: (booking: IBooking) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {booking.doctor_id?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {booking.doctor_id?.name}
            </div>
            <div className="text-xs text-gray-500">Doctor</div>
          </div>
        </div>
      ),
    },
    {
      header: "Patient",
      accessor: "user_id.name",
      render: (booking: IBooking) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {booking.user_id?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {booking.user_id.name}
            </div>
            <div className="text-xs text-gray-500">Patient</div>
          </div>
        </div>
      ),
    },
    {
      header: "Doctor Fee",
      accessor: "ticketPrice",
      render: (booking: IBooking) => (
        <>
          <div className="text-sm font-bold text-gray-900">
            ₹{booking.ticketPrice.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Base fee</div>
        </>
      ),
    },
    {
      header: "Total",
      accessor: "totalAmount",
      render: (booking: IBooking) => (
        <>
          <div className="text-sm font-bold text-green-600">
            ₹{booking.totalAmount?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Final amount</div>
        </>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (booking: IBooking) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
            booking.status
          )}`}
        >
          {getStatusIcon(booking.status)}
          {formatStatus(booking.status)}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "appointmentDate",
      render: (booking: IBooking) => (
        <>
          <div className="text-sm font-medium text-gray-900">
            {new Date(booking.appointmentDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(booking.appointmentDate).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </div>
        </>
      ),
    },
    {
      header: "Actions",
      render: (booking: any) => (
        <button
          onClick={() => handleViewBookingDetails(booking)}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      ),
    },
  ];
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Appointment Bookings
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage and monitor all appointment bookings
                </p>
              </div>

              {/* Filter Section */}
              <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="status-filter"
                    className="text-sm font-medium text-gray-700 whitespace-nowrap"
                  >
                    Filter Status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]"
                  >
                    <option value="all">All Statuses</option>
                    {Object.values(AppointmentStatus).map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading bookings...</p>
              </div>
            ) : (
              <>
                {/* Table Section */}
                <Table
                  columns={columns}
                  data={bookings}
                  loading={loading}
                  emptyMessage="No bookings available."
                />

                {/* Pagination Section */}
                {bookings.length > 0 && (
                  <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Showing{" "}
                        <span className="font-semibold text-gray-900">
                          {(currentPage - 1) * 5 + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-gray-900">
                          {Math.min(
                            currentPage * 5,
                            (currentPage - 1) * 5 + bookings.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-900">
                          {(totalPages * 5).toLocaleString()}
                        </span>{" "}
                        entries
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {selectedBooking && (
            <BookingDetailModal
              booking={selectedBooking}
              onClose={closeModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;

// import { useState, useEffect } from "react";
// import adminApi from "../../axios/AdminInstance";
// import Pagination from "../../Pagination/Pagination";

// enum AppointmentStatus {
//   PENDING = "pending",
//   CONFIRMED = "confirmed",
//   PAYMENT_FAILED = "payment_failed",
//   CANCELLED = "cancelled",
//   PAYMENT_PENDING = "payment_pending",
//   EXPIRED = "expired",
//   COMPLETED = "completed",
// }

// interface IBooking {
//   _id: string;
//   doctor_id: {
//     name: string;
//   };
//   user_id: {
//     name: string;
//   };
//   ticketPrice: number;
//   discount?: number;
//   status: AppointmentStatus;
//   appointmentDate: string;
//   totalAmount : number;
// }

// const BookingsPage = () => {
//   const [bookings, setBookings] = useState<IBooking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
//     "all"
//   );

//   const fetchBookings = async (
//     page: number,
//     status?: AppointmentStatus | "all"
//   ) => {
//     try {
//       setLoading(true);
//       const response = await adminApi.get(
//         `/bookings?page=${page}&limit=5${
//           status && status !== "all" ? `&status=${status}` : ""
//         }`
//       );
//       const data = await response.data.data;
//       console.log("All Bookings:", data);

//       setBookings(data?.bookings || []);
//       setTotalPages(data?.totalPages || 1);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching bookings:", error);
//       setBookings([]);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings(
//       currentPage,
//       statusFilter !== "all" ? statusFilter : undefined
//     );
//   }, [currentPage, statusFilter]);

//   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setStatusFilter(e.target.value as AppointmentStatus | "all");
//     setCurrentPage(1); // Reset to first page when filter changes
//   };

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Main Content */}
//       <div className="flex-1 p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <div className="flex justify-between items-center mb-8">
//               <h1 className="text-3xl font-extrabold text-gray-900">Bookings</h1>
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center">
//                   <label
//                     htmlFor="status-filter"
//                     className="mr-3 text-sm font-semibold text-gray-700"
//                   >
//                     Filter by Status:
//                   </label>
//                   <select
//                     id="status-filter"
//                     value={statusFilter}
//                     onChange={handleStatusChange}
//                     className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
//                   >
//                     <option value="all">All Statuses</option>
//                     {Object.values(AppointmentStatus).map((status) => (
//                       <option key={status} value={status}>
//                         {status.charAt(0).toUpperCase() + status.slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {loading ? (
//               <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
//               </div>
//             ) : (
//               <>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200 rounded-lg">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Doctor Name
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Patient Name
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Doctor Amount
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Total Amount
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Status
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {bookings && bookings.length > 0 ? (
//                         bookings.map((booking, index) => (
//                           <tr
//                             key={booking._id}
//                             className={`${
//                               index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                             } hover:bg-blue-50 transition-colors duration-200`}
//                           >
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                               {booking.doctor_id.name}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                               {booking.user_id.name}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                               ₹{booking.ticketPrice.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                               ₹{booking.totalAmount.toLocaleString() || "0"}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span
//                                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                   booking.status === "completed"
//                                     ? "bg-green-100 text-green-800"
//                                     : booking.status === "cancelled"
//                                     ? "bg-red-100 text-red-800"
//                                     : booking.status === "confirmed"
//                                     ? "bg-blue-100 text-blue-800"
//                                     : "bg-yellow-100 text-yellow-800"
//                                 }`}
//                               >
//                                 {booking.status}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                               {new Date(
//                                 booking.appointmentDate
//                               ).toLocaleDateString()}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td
//                             colSpan={7}
//                             className="px-6 py-4 text-center text-sm text-gray-500"
//                           >
//                             No bookings found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination */}
//                 <div className="flex items-center justify-between mt-6">
//                   <div className="text-sm text-gray-600">
//                     Showing{" "}
//                     <span className="font-semibold">
//                       {(currentPage - 1) * 5 + 1}
//                     </span>{" "}
//                     to{" "}
//                     <span className="font-semibold">
//                       {Math.min(
//                         currentPage * 5,
//                         (currentPage - 1) * 5 + bookings.length
//                       )}
//                     </span>{" "}
//                     of{" "}
//                     <span className="font-semibold">
//                       {(totalPages * 5).toLocaleString()}
//                     </span>{" "}
//                     entries
//                   </div>
//                   <Pagination
//                     currentPage={currentPage}
//                     totalPages={totalPages}
//                     onPageChange={handlePageChange}
//                   />
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookingsPage;
