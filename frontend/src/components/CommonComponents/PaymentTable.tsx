"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  CreditCard,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Receipt,
  TrendingUp,
  Search,
  IndianRupee,
} from "lucide-react"
import Pagination from "../../Pagination/Pagination"
import { type IPayment, PaymentStatus } from "../../types/paymentTypes"
import { getDisplayStatusLabel } from "../../Utils/PaymentTable"

interface Props {
  title: string
  fetchData: (page: number, status?: PaymentStatus | "all") => Promise<IPayment[]>
  totalPages: number
}

const PaymentTable = ({ title, fetchData, totalPages }: Props) => {
  const [payments, setPayments] = useState<IPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const data = await fetchData(currentPage, statusFilter !== "all" ? statusFilter : undefined)
      setPayments(data)
      setLoading(false)
    }
    fetch()
  }, [currentPage, statusFilter])

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as PaymentStatus | "all")
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => setCurrentPage(page)

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case PaymentStatus.PAYMENT_FAILED:
        return <XCircle className="w-4 h-4 text-red-600" />
      case PaymentStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-600" />
      case PaymentStatus.CANCELLED:
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
      case PaymentStatus.PAYMENT_FAILED:
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
      case PaymentStatus.PENDING:
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200"
      case PaymentStatus.CANCELLED:
        return "bg-gradient-to-r from-orange-100 to-orange-100 text-orange-800 border border-orange-200"
      default:
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-blue-100 mt-1">Track and manage your payment transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Filter Options</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label htmlFor="status-filter" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Status:</span>
            </label>
            <div className="relative">
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusChange}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {Object.values(PaymentStatus).map((status) => (
                  <option key={status} value={status}>
                    {getDisplayStatusLabel(status)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">Loading Payment History</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your transactions...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200/60 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">User</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <IndianRupee className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Date</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Appointment Date
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.length > 0 ? (
                      payments.map((payment, index) => (
                        <tr
                          key={payment._id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          } hover:bg-blue-50/50 transition-all duration-200 group`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                  {payment.user_id.name}
                                </p>
                                <p className="text-xs text-gray-500">Patient</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <IndianRupee className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-gray-900">₹{payment.totalAmount.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">INR</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <span
                                className={`px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-full shadow-sm ${getStatusBadgeClass(
                                  payment.status,
                                )}`}
                              >
                                {getDisplayStatusLabel(payment.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(payment.paymentDate).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {new Date(payment.appointmentDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">Appointment</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                              <Receipt className="w-10 h-10 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-700">No payments found</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {statusFilter !== "all"
                                  ? `No payments with status "${getDisplayStatusLabel(statusFilter as PaymentStatus)}"`
                                  : "You haven't made any payments yet"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Pagination Section */}
            {payments.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/60">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4 sm:mb-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium">Showing </span>
                    <span className="font-bold text-blue-600">{(currentPage - 1) * 5 + 1}</span>
                    <span className="font-medium"> to </span>
                    <span className="font-bold text-blue-600">{(currentPage - 1) * 5 + payments.length}</span>
                    <span className="font-medium"> of </span>
                    <span className="font-bold text-blue-600">{totalPages * 5}</span>
                    <span className="font-medium"> entries</span>
                  </div>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentTable



// import { useEffect, useState } from "react";
// import Pagination from "../../Pagination/Pagination";
// import { IPayment, PaymentStatus } from "../../types/paymentTypes";
// import { getDisplayStatusLabel } from "../../Utils/PaymentTable";

// interface Props {
//   title: string;
//   fetchData: (
//     page: number,
//     status?: PaymentStatus | "all"
//   ) => Promise<IPayment[]>;
//   totalPages: number;
// }

// const PaymentTable = ({ title, fetchData, totalPages }: Props) => {
//   const [payments, setPayments] = useState<IPayment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
//     "all"
//   );

//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       const data = await fetchData(
//         currentPage,
//         statusFilter !== "all" ? statusFilter : undefined
//       );
//       setPayments(data);
//       setLoading(false);
//     };
//     fetch();
//   }, [currentPage, statusFilter]);

//   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setStatusFilter(e.target.value as PaymentStatus | "all");
//     setCurrentPage(1);
//   };

//   const handlePageChange = (page: number) => setCurrentPage(page);

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
//         <div className="flex items-center space-x-4">
//           <label
//             htmlFor="status-filter"
//             className="text-sm font-semibold text-gray-700"
//           >
//             Filter by Status:
//           </label>
//           <select
//             id="status-filter"
//             value={statusFilter}
//             onChange={handleStatusChange}
//             className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm"
//           >
//             <option value="all">All Statuses</option>
//             {Object.values(PaymentStatus).map((status) => (
//               <option key={status} value={status}>
//                 {getDisplayStatusLabel(status)}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 rounded-lg">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold">
//                     User
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold">
//                     Amount
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold">
//                     Status
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold">
//                     Payment Date
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold">
//                     Appointment Date
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {payments.length > 0 ? (
//                   payments.map((payment, index) => (
//                     <tr
//                       key={payment._id}
//                       className={`${
//                         index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                       } hover:bg-blue-50 transition-colors duration-200`}
//                     >
//                       <td className="px-6 py-4 text-sm font-medium">
//                         {payment.user_id.name}
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         ₹{payment.amount.toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         <span
//                           className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
//                             payment.status === PaymentStatus.SUCCESS
//                               ? "bg-green-100 text-green-800"
//                               : payment.status === PaymentStatus.PAYMENT_FAILED
//                               ? "bg-red-100 text-red-800"
//                               : payment.status === PaymentStatus.PENDING
//                               ? "bg-yellow-100 text-yellow-800"
//                               : payment.status === PaymentStatus.CANCELLED
//                               ? "bg-orange-100 text-orange-800"
//                               : "bg-blue-100 text-blue-800"
//                           }`}
//                         >
//                           {getDisplayStatusLabel(payment.status)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         {new Date(payment.paymentDate).toLocaleDateString()}
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         {new Date(payment.appointmentDate).toLocaleDateString()}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="px-6 py-4 text-center text-sm text-gray-500"
//                     >
//                       No payments found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex justify-between items-center mt-6">
//             <div className="text-sm text-gray-600">
//               Showing{" "}
//               <span className="font-semibold">{(currentPage - 1) * 5 + 1}</span>{" "}
//               to{" "}
//               <span className="font-semibold">
//                 {(currentPage - 1) * 5 + payments.length}
//               </span>{" "}
//               of <span className="font-semibold">{totalPages * 5}</span> entries
//             </div>
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={handlePageChange}
//             />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default PaymentTable;
