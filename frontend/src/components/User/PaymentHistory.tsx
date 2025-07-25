"use client"

import { useState } from "react"
import type { IPayment } from "../../types/paymentTypes"
import PaymentTable from "../CommonComponents/PaymentTable"
import { transformBookingToPayment } from "../../Utils/PaymentTable"
import { createApiInstance } from "../../axios/apiService"

const api = createApiInstance("user")

const PaymentHistory = () => {
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = async (page: number, status?: string): Promise<IPayment[]> => {
    try {
      const response = await api.get(`/payments/history?page=${page}&limit=5${status ? `&status=${status}` : ""}`)
      console.log("Result : ", response.data.data)
      const responseData = response.data?.data
      setTotalPages(responseData?.totalPages || 1)
      return (responseData?.payments || []).map(transformBookingToPayment)
    } catch (error) {
      console.error("Error fetching payments:", error)
      return []
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <PaymentTable title="My Payment History" fetchData={fetchData} totalPages={totalPages} />
      </div>
    </div>
  )
}

export default PaymentHistory



// import { useState } from "react";
// import { IPayment } from "../../types/paymentTypes";
// // import api from "../../axios/UserInstance";
// import PaymentTable from "../CommonComponents/PaymentTable";
// import { transformBookingToPayment } from "../../Utils/PaymentTable";
// import { createApiInstance } from "../../axios/apiService";

// const api = createApiInstance("user");

// const PaymentHistory = () => {
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchData = async (
//     page: number,
//     status?: string
//   ): Promise<IPayment[]> => {
//     try {
//       const response = await api.get(
//         `/payments/history?page=${page}&limit=5${
//           status ? `&status=${status}` : ""
//         }`
//       );
//       console.log("Result : ", response.data.data);
//       const responseData = response.data?.data;
//       setTotalPages(responseData?.totalPages || 1);
//       return (responseData?.payments || []).map(transformBookingToPayment);
//     } catch (error) {
//       console.error("Error fetching payments:", error);
//       return [];
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-6xl mx-auto">
//         <PaymentTable
//           title="My Payment History"
//           fetchData={fetchData}
//           totalPages={totalPages}
//         />
//       </div>
//     </div>
//   );
// };

// export default PaymentHistory;
