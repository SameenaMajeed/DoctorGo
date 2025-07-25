
import { useState } from "react";
import { IPayment } from "../../types/paymentTypes";
// import api from "../../axios/UserInstance";
import PaymentTable from "../CommonComponents/PaymentTable";
import { transformBookingToPayment } from "../../Utils/PaymentTable";
import { createApiInstance } from "../../axios/apiService";

const api = createApiInstance("user");

const PaymentHistory = () => {
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (page: number, status?: string): Promise<IPayment[]> => {
  try {
    const response = await api.get(`/payments/history?page=${page}&limit=5${status ? `&status=${status}` : ""}`);
    const responseData = response.data?.data;
    setTotalPages(responseData?.totalPages || 1);
    return (responseData?.payments || []).map(transformBookingToPayment);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <PaymentTable title="My Payment History" fetchData={fetchData} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default PaymentHistory;
