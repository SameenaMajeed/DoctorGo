"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
// import adminApi from "../../axios/AdminInstance";
import Pagination from "../../Pagination/Pagination";
import { Table } from "../CommonComponents/Table";
import { getPaymentStatusColor, mapBookingStatusToPaymentStatus } from "../../types/StatusCode";
import { IBooking } from "../../Types";
import { IPayment, PaymentStatus } from "../../types/paymentTypes";
import { createApiInstance } from "../../axios/apiService";

const adminApi = createApiInstance("admin");

const getDisplayStatusLabel = (status: string): string =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const transformBookingToPayment = (booking: IBooking): IPayment => ({
  _id: booking._id,
  user_id: booking.user_id,
  amount: booking.totalAmount,
  platformFee : booking.platformFee,
  status: mapBookingStatusToPaymentStatus(booking.status),
  paymentDate: booking.createdAt,
  originalStatus: booking.status,
  appointmentDate: booking.appointmentDate,
});

const PaymentsPage = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );

  const fetchPayments = async (
    page: number,
    status?: PaymentStatus | "all"
  ) => {
    try {
      setLoading(true);
      const response = await adminApi.get(
        `/bookings?page=${page}&limit=5${
          status && status !== "all"
            ? `&status=${Object.keys(PaymentStatus)
                .find(
                  (key) =>
                    PaymentStatus[key as keyof typeof PaymentStatus] === status
                )
                ?.toLowerCase()}`
            : ""
        }`
      );
      const data = await response.data.data;
      const transformedPayments = (data?.bookings || []).map(
        transformBookingToPayment
      );
      const filteredPayments =
        status && status !== "all"
          ? transformedPayments.filter(
              (payment: IPayment) => payment.status === status
            )
          : transformedPayments;
      setPayments(filteredPayments);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(
      currentPage,
      statusFilter !== "all" ? statusFilter : undefined
    );
  }, [currentPage, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as PaymentStatus | "all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPaymentStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return <CheckCircle className="w-4 h-4" />;
      case PaymentStatus.PAYMENT_FAILED:
        return <XCircle className="w-4 h-4" />;
      case PaymentStatus.PENDING:
        return <Clock className="w-4 h-4" />;
      case PaymentStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      case PaymentStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const columns = [
    {
      header: "User",
      render: (payment: IPayment) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {payment.user_id.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {payment.user_id.name}
            </div>
            <div className="text-xs text-gray-500">Patient</div>
          </div>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (payment: IPayment) => (
        <div className="text-sm font-bold text-green-600">
          ₹{payment.amount.toLocaleString()}
        </div>
      ),
    },
    {
      header: "PlatForm Fee",
      render: (payment: IPayment) => (
        <div className="text-sm font-bold text-green-600">
          ₹{payment.platformFee.toLocaleString()}
        </div>
      ),
    },
    {
      header: "Status",
      render: (payment: IPayment) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getPaymentStatusColor(
            payment.status
          )}`}
        >
          {getPaymentStatusIcon(payment.status)}
          {getDisplayStatusLabel(payment.status)}
        </span>
      ),
    },
    {
      header: "Payment Date",
      render: (payment: IPayment) => (
        <>
          <div className="text-sm font-medium text-gray-900">
            {new Date(payment.paymentDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(payment.paymentDate).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </div>
        </>
      ),
    },
    {
      header: "Appointment Date",
      render: (payment: IPayment) => (
        <>
          <div className="text-sm font-medium text-gray-900">
            {new Date(payment.appointmentDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(payment.appointmentDate).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </div>
        </>
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
                  Payment Transactions
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Monitor and manage all payment records
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
                    {Object.values(PaymentStatus).map((status) => (
                      <option key={status} value={status}>
                        {getDisplayStatusLabel(status)}
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
                <p className="text-gray-500 font-medium">Loading payments...</p>
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={payments}
                  loading={loading}
                  emptyMessage={
                    statusFilter !== "all"
                      ? `No payments with status "${getDisplayStatusLabel(
                          statusFilter
                        )}" found.`
                      : "There are no payment records to display at the moment."
                  }
                />

                {/* Pagination Section */}
                {payments.length > 0 && (
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
                            (currentPage - 1) * 5 + payments.length
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
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;

// import { useState, useEffect } from "react";
// import adminApi from "../../axios/AdminInstance";
// import Pagination from "../../Pagination/Pagination";

// enum AppointmentStatus {
//   PENDING = "pending",
//   CONFIRMED = "confirmed",
//   FAILED = "failed",
//   CANCELLED = "cancelled",
//   PAYMENT_PENDING = "payment_pending",
//   EXPIRED = "expired",
//   COMPLETED = "completed",
// }

// enum PaymentStatus {
//   SUCCESS = "success",
//   PAYMENT_FAILED = "failed",
//   PENDING = "pending",
//   CANCELLED = "cancelled",
//   CONFIRMED = "confirmed",
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
//   createdAt: string;
//   appointmentDate: string;
// }

// interface IPayment {
//   _id: string;
//   user_id: {
//     name: string;
//   };
//   amount: number;
//   status: PaymentStatus;
//   paymentDate: string;
//   originalStatus: AppointmentStatus;
//   appointmentDate : string
// }

// const mapBookingStatusToPaymentStatus = (
//   bookingStatus: AppointmentStatus
// ): PaymentStatus => {
//   switch (bookingStatus) {
//     case AppointmentStatus.COMPLETED:
//       return PaymentStatus.SUCCESS;
//     case AppointmentStatus.FAILED:
//       return PaymentStatus.PAYMENT_FAILED;
//     case AppointmentStatus.PAYMENT_PENDING:
//       return PaymentStatus.PENDING;
//     case AppointmentStatus.CANCELLED:
//     case AppointmentStatus.EXPIRED:
//       return PaymentStatus.CANCELLED;
//     default:
//       return PaymentStatus.CONFIRMED;
//   }
// };

// const getDisplayStatusLabel = (status: string): string =>
//   status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

// const transformBookingToPayment = (booking: IBooking): IPayment => ({
//   _id: booking._id,
//   user_id: booking.user_id,
//   amount: booking.ticketPrice - (booking.discount || 0),
//   status: mapBookingStatusToPaymentStatus(booking.status),
//   paymentDate: booking.createdAt,
//   originalStatus: booking.status,
//   appointmentDate : booking.appointmentDate,
// });

// const PaymentsPage = () => {
//   const [payments, setPayments] = useState<IPayment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
//     "all"
//   );

//   const fetchPayments = async (
//     page: number,
//     status?: PaymentStatus | "all"
//   ) => {
//     try {
//       setLoading(true);
//       const response = await adminApi.get(
//         `/bookings?page=${page}&limit=5${
//           status && status !== "all"
//             ? `&status=${Object.keys(PaymentStatus)
//                 .find(
//                   (key) =>
//                     PaymentStatus[key as keyof typeof PaymentStatus] === status
//                 )
//                 ?.toLowerCase()}`
//             : ""
//         }`
//       );

//       const data = await response.data.data;
//       const transformedPayments = (data?.bookings || []).map(
//         transformBookingToPayment
//       );

//       const filteredPayments =
//         status && status !== "all"
//           ? transformedPayments.filter(
//               (payment: IPayment) => payment.status === status
//             )
//           : transformedPayments;

//       setPayments(filteredPayments);
//       setTotalPages(data?.totalPages || 1);
//     } catch (error) {
//       console.error("Error fetching payments:", error);
//       setPayments([]);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   console.log(payments);

//   useEffect(() => {
//     fetchPayments(
//       currentPage,
//       statusFilter !== "all" ? statusFilter : undefined
//     );
//   }, [currentPage, statusFilter]);

//   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setStatusFilter(e.target.value as PaymentStatus | "all");
//     setCurrentPage(1);
//   };

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <div className="flex-1 p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <div className="flex justify-between items-center mb-8">
//               <h1 className="text-3xl font-extrabold text-gray-900">
//                 Payments
//               </h1>
//               <div className="flex items-center space-x-4">
//                 <label
//                   htmlFor="status-filter"
//                   className="text-sm font-semibold text-gray-700"
//                 >
//                   Filter by Status:
//                 </label>
//                 <select
//                   id="status-filter"
//                   value={statusFilter}
//                   onChange={handleStatusChange}
//                   className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="all">All Statuses</option>
//                   {Object.values(PaymentStatus).map((status) => (
//                     <option key={status} value={status}>
//                       {getDisplayStatusLabel(status)}
//                     </option>
//                   ))}
//                 </select>
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
//                           User
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Amount
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Status
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Payment Date
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                           Appointment Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {payments.length > 0 ? (
//                         payments.map((payment, index) => (
//                           <tr
//                             key={payment._id}
//                             className={`${
//                               index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                             } hover:bg-blue-50 transition-colors duration-200`}
//                           >
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                               {payment.user_id.name}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                               ₹{payment.amount.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span
//                                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                   payment.status === PaymentStatus.SUCCESS
//                                     ? "bg-green-100 text-green-800"
//                                     : payment.status ===
//                                       PaymentStatus.PAYMENT_FAILED
//                                     ? "bg-red-100 text-red-800"
//                                     : payment.status === PaymentStatus.PENDING
//                                     ? "bg-yellow-100 text-yellow-800"
//                                     : payment.status === PaymentStatus.CANCELLED
//                                     ? "bg-orange-100 text-orange-800"
//                                     : "bg-blue-100 text-blue-800"
//                                 }`}
//                               >
//                                 {getDisplayStatusLabel(payment.status)}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                               {new Date(
//                                 payment.paymentDate
//                               ).toLocaleDateString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                               {new Date(
//                                 payment.appointmentDate
//                               ).toLocaleDateString()}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td
//                             colSpan={4}
//                             className="px-6 py-4 text-center text-sm text-gray-500"
//                           >
//                             No payments found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

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
//                         (currentPage - 1) * 5 + payments.length
//                       )}
//                     </span>{" "}
//                     of <span className="font-semibold">{totalPages * 5}</span>{" "}
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

// export default PaymentsPage;
