import { useEffect, useState } from "react";
import Pagination from "../../Pagination/Pagination";
import { IPayment, PaymentStatus } from "../../types/paymentTypes";
import { getDisplayStatusLabel } from "../../Utils/PaymentTable";

interface Props {
  title: string;
  fetchData: (
    page: number,
    status?: PaymentStatus | "all"
  ) => Promise<IPayment[]>;
  totalPages: number;
}

const PaymentTable = ({ title, fetchData, totalPages }: Props) => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all"
  );

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await fetchData(
        currentPage,
        statusFilter !== "all" ? statusFilter : undefined
      );
      setPayments(data);
      setLoading(false);
    };
    fetch();
  }, [currentPage, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as PaymentStatus | "all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-4">
          <label
            htmlFor="status-filter"
            className="text-sm font-semibold text-gray-700"
          >
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusChange}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">
                    Payment Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">
                    Appointment Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment, index) => (
                    <tr
                      key={payment._id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors duration-200`}
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {payment.user_id.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                            payment.status === PaymentStatus.SUCCESS
                              ? "bg-green-100 text-green-800"
                              : payment.status === PaymentStatus.PAYMENT_FAILED
                              ? "bg-red-100 text-red-800"
                              : payment.status === PaymentStatus.PENDING
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === PaymentStatus.CANCELLED
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {getDisplayStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(payment.appointmentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{(currentPage - 1) * 5 + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {(currentPage - 1) * 5 + payments.length}
              </span>{" "}
              of <span className="font-semibold">{totalPages * 5}</span> entries
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentTable;
