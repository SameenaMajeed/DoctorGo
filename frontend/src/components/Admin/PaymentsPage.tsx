import { useState, useEffect } from "react";
import adminApi from "../../axios/AdminInstance";
import AdminSidebar from "./Home/AdminSidebar";
import Pagination from "../../Pagination/Pagination";


enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PAYMENT_FAILED = "payment_failed",
  CANCELLED = "cancelled",
  PAYMENT_PENDING = "payment_pending",
  EXPIRED = "expired",
  COMPLETED = "completed",
}

enum PaymentStatus {
  SUCCESS = "success",
  FAILED = "failed",
  PENDING = "pending",
  CANCELLED = "cancelled",
}

interface IBooking {
  _id: string;
  doctor_id: {
    name: string;
  };
  user_id: {
    name: string;
  };
  ticketPrice: number;
  discount?: number;
  status: AppointmentStatus;
  appointmentDate: string;
}

interface IPayment {
  _id: string;
  user_id: {
    name: string;
  };
  amount: number;
  status: PaymentStatus;
  paymentDate: string;
}

const mapBookingStatusToPaymentStatus = (bookingStatus: AppointmentStatus): PaymentStatus => {
  switch (bookingStatus) {
    case AppointmentStatus.COMPLETED:
      return PaymentStatus.SUCCESS;
    case AppointmentStatus.PAYMENT_FAILED:
      return PaymentStatus.FAILED;
    case AppointmentStatus.PAYMENT_PENDING:
      return PaymentStatus.PENDING;
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.EXPIRED:
      return PaymentStatus.CANCELLED;
    default:
      return PaymentStatus.PENDING;
  }
};

const transformBookingToPayment = (booking: IBooking): IPayment => ({
  _id: booking._id,
  user_id: booking.user_id,
  amount: booking.ticketPrice - (booking.discount || 0),
  status: mapBookingStatusToPaymentStatus(booking.status),
  paymentDate: booking.appointmentDate,
});

const PaymentsPage = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");

  const fetchPayments = async (
    page: number,
    status?: PaymentStatus | "all"
  ) => {
    try {
      setLoading(true);
      const response = await adminApi.get(
        `/bookings?page=${page}&limit=5${
          status && status !== "all"
            ? `&status=${Object.keys(PaymentStatus).find(
                (key) => PaymentStatus[key as keyof typeof PaymentStatus] === status
              )?.toLowerCase()}`
            : ""
        }`
      );
      const data = await response.data.data;
      console.log("All Bookings (for Payments):", data);

      const transformedPayments = (data?.bookings || []).map(transformBookingToPayment);

      const filteredPayments =
        status && status !== "all"
          ? transformedPayments.filter((payment: IPayment) => payment.status === status)
          : transformedPayments;

      setPayments(filteredPayments);
      setTotalPages(data?.totalPages || 1);
      setLoading(false);
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
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg">
        <AdminSidebar />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">Payments</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label
                    htmlFor="status-filter"
                    className="mr-3 text-sm font-semibold text-gray-700"
                  >
                    Filter by Status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="all">All Statuses</option>
                    {Object.values(PaymentStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments && payments.length > 0 ? (
                        payments.map((payment, index) => (
                          <tr
                            key={payment._id}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-blue-50 transition-colors duration-200`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.user_id.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              ₹{payment.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.status === "success"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : payment.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No payments found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) * 5 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        currentPage * 5,
                        (currentPage - 1) * 5 + payments.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {(totalPages * 5).toLocaleString()}
                    </span>{" "}
                    entries
                  </div>
                  <div>
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;