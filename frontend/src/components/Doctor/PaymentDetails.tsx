"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Search,
  CreditCard,
  TrendingUp,
  Download,
  RefreshCw,
  IndianRupee,
} from "lucide-react"
import Pagination from "../../Pagination/Pagination"
import doctorApi from "../../axios/DoctorInstance"

enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  PAYMENT_PENDING = "payment_pending",
  EXPIRED = "expired",
  COMPLETED = "completed",
}

enum PaymentStatus {
  SUCCESS = "success",
  PAYMENT_FAILED = "failed",
  PENDING = "pending",
  CANCELLED = "cancelled",
  CONFIRMED = "confirmed",
}

interface IBooking {
  _id: string
  doctor_id: {
    name: string
  }
  user_id: {
    name: string
  }
  ticketPrice: number
  discount?: number
  status: AppointmentStatus
  createdAt: string
  appointmentDate: string
}

interface IPayment {
  _id: string
  user_id: {
    name: string
  }
  amount: number
  status: PaymentStatus
  paymentDate: string
  originalStatus: AppointmentStatus
  appointmentDate: string
}

const mapBookingStatusToPaymentStatus = (bookingStatus: AppointmentStatus): PaymentStatus => {
  switch (bookingStatus) {
    case AppointmentStatus.COMPLETED:
      return PaymentStatus.SUCCESS
    case AppointmentStatus.FAILED:
      return PaymentStatus.PAYMENT_FAILED
    case AppointmentStatus.PAYMENT_PENDING:
      return PaymentStatus.PENDING
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.EXPIRED:
      return PaymentStatus.CANCELLED
    default:
      return PaymentStatus.CONFIRMED
  }
}

const getDisplayStatusLabel = (status: string): string =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

const transformBookingToPayment = (booking: IBooking): IPayment => ({
  _id: booking._id,
  user_id: booking.user_id,
  amount: booking.ticketPrice - (booking.discount || 0),
  status: mapBookingStatusToPaymentStatus(booking.status),
  paymentDate: booking.createdAt,
  originalStatus: booking.status,
  appointmentDate: booking.appointmentDate,
})

const PaymentDetails: React.FC = () => {
  const [payments, setPayments] = useState<IPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter] = useState<PaymentStatus | "all">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPayments = async (page: number, status?: PaymentStatus | "all") => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }

      const response = await doctorApi.get(
        `/bookings?page=${page}&limit=5${
          status && status !== "all"
            ? `&status=${Object.keys(PaymentStatus)
                .find((key) => PaymentStatus[key as keyof typeof PaymentStatus] === status)
                ?.toLowerCase()}`
            : ""
        }`,
      )
      const data = await response.data.data
      const transformedPayments = (data?.bookings || []).map(transformBookingToPayment)
      const filteredPayments =
        status && status !== "all"
          ? transformedPayments.filter((payment: IPayment) => payment.status === status)
          : transformedPayments

      setPayments(filteredPayments)
      setTotalPages(data?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching payments:", error)
      setPayments([])
      setTotalPages(1)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPayments(currentPage, statusFilter !== "all" ? statusFilter : undefined)
  }, [currentPage, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchPayments(currentPage, statusFilter !== "all" ? statusFilter : undefined)
    }
  }

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return <CheckCircle className="w-4 h-4" />
      case PaymentStatus.PAYMENT_FAILED:
        return <XCircle className="w-4 h-4" />
      case PaymentStatus.PENDING:
        return <Clock className="w-4 h-4" />
      case PaymentStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />
      case PaymentStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case PaymentStatus.PAYMENT_FAILED:
        return "bg-red-50 text-red-700 border-red-200"
      case PaymentStatus.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-200"
      case PaymentStatus.CANCELLED:
        return "bg-orange-50 text-orange-700 border-orange-200"
      case PaymentStatus.CONFIRMED:
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTotalRevenue = () => {
    return payments
      .filter((payment) => payment.status === PaymentStatus.SUCCESS)
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getSuccessfulPayments = () => {
    return payments.filter((payment) => payment.status === PaymentStatus.SUCCESS).length
  }

  const filteredPayments = payments.filter((payment) =>
    payment.user_id.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Payment Details</h1>
                <p className="text-blue-100 text-sm sm:text-base">Track and manage all your payment transactions</p>
                <p className="text-blue-200 text-xs mt-1">
                  Updated as of{" "}
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="text-sm font-medium">Refresh</span>
                </button>

                {/* <button className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button> */}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
                  <div className="flex items-center mt-2">
                    <CreditCard className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-600 text-xs font-medium">All transactions</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Successful Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{getSuccessfulPayments()}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 text-xs font-medium">Completed</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(getTotalRevenue())}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-600 text-xs font-medium">Earnings</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Average Payment</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(getSuccessfulPayments() > 0 ? getTotalRevenue() / getSuccessfulPayments() : 0)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-purple-600 text-xs font-medium">Per transaction</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Search and Filter Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Transactions</h2>
                  <p className="text-gray-500 text-sm">Detailed view of all payment activities</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by patient name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-96 space-y-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-gray-500 font-medium">Loading payment details...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="table-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overflow-x-auto"
                  >
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Patient
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-4 h-4" />
                              Amount
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Status
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Payment Date
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Appointment Date
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredPayments.length > 0 ? (
                          filteredPayments.map((payment, index) => (
                            <motion.tr
                              key={payment._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              } hover:bg-blue-50/50 transition-all duration-200 group`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                    {payment.user_id.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">{payment.user_id.name}</div>
                                    <div className="text-xs text-gray-500">Patient</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                                <div className="text-xs text-gray-500">Payment amount</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                                    payment.status,
                                  )}`}
                                >
                                  {getStatusIcon(payment.status)}
                                  {getDisplayStatusLabel(payment.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(payment.paymentDate)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(payment.paymentDate).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(payment.appointmentDate)}
                                </div>
                                <div className="text-xs text-gray-500">Scheduled date</div>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No payments found</h3>
                                  <p className="text-gray-500 text-sm">
                                    {searchTerm
                                      ? `No payments match "${searchTerm}"`
                                      : "There are no payment records to display at the moment."}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Pagination Footer */}
            {filteredPayments.length > 0 && (
              <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * 5 + 1}</span> to{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(currentPage * 5, (currentPage - 1) * 5 + filteredPayments.length)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-900">{totalPages * 5}</span> entries
                  </div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetails


// import { useState, useEffect } from "react";
// import Pagination from "../../Pagination/Pagination";
// import doctorApi from "../../axios/DoctorInstance";

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

// const PaymentDetails = () => {
//   const [payments, setPayments] = useState<IPayment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
// //   const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
// //     "all"
// //   );
//   const [statusFilter] = useState<PaymentStatus | "all">(
//     "all"
//   );

//   const fetchPayments = async (
//     page: number,
//     status?: PaymentStatus | "all"
//   ) => {
//     try {
//       setLoading(true);
//       const response = await doctorApi.get(
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

// //   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //     setStatusFilter(e.target.value as PaymentStatus | "all");
// //     setCurrentPage(1);
// //   };

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
//               {/* <div className="flex items-center space-x-4">
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
//               </div> */}
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

// export default PaymentDetails;