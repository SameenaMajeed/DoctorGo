// import React from "react";
// import Navbar from "./Home/Navbar";
// import Footer from "../CommonComponents/Footer";
// import api from "../../axios/UserInstance";

// const Payment: React.FC = () => {
//   const handlePayment = async () => {
//     try {
//       const response = await api.post("/payments/create-order", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`, // Add auth token if required
//         },
//         body: JSON.stringify({ amount: 500 }), // Replace with actual amount
//       });
  
//       const data = await response.json();
//       if (!data.success) {
//         alert("Failed to create order");
//         return;
//       }
  
//       const options = {
//         key: "rzp_test_nRejkmtVvzC6y2", // Replace with your Razorpay key
//         amount: data.order.amount, // Amount from backend
//         currency: data.order.currency,
//         name: "DoctorGo",
//         description: "Doctor Appointment Payment",
//         image: "/doctor.jpg",
//         order_id: data.order.id, // Razorpay order ID from backend
//         handler: async function (response: any) {
//           alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
          
//           // Call backend to verify payment
//           const verifyResponse = await fetch("/payments/verify-payment", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(response),
//           });
  
//           const verifyData = await verifyResponse.json();
//           if (verifyData.success) {
//             alert("Payment verified successfully");
//           } else {
//             alert("Payment verification failed");
//           }
//         },
//         theme: { color: "#528FF0" },
//       };
  
//       const razorpay = new (window as any).Razorpay(options);
//       razorpay.open();
//     } catch (error) {
//       console.error("Payment Error:", error);
//       alert("Something went wrong");
//     }
//   };
  

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <Navbar />
//       <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
//         <h2 className="text-2xl font-semibold text-center text-gray-800">Confirm Payment</h2>

//         <div className="flex flex-col md:flex-row items-center justify-between mt-6">
//           {/* Doctor Info */}
//           <div className="flex flex-col items-center bg-blue-100 p-4 rounded-lg">
//             <img src="/doctor.jpg" alt="Doctor" className="w-28 h-28 rounded-lg" />
//             <h3 className="text-lg font-semibold mt-2">Dr. Muhtibur Rahman</h3>
//             <p className="text-gray-600">Neurologist</p>
//             <span className="text-xl font-bold text-blue-600 mt-2">₹500</span>
//           </div>

//           {/* Payment Form */}
//           <div className="w-full md:w-1/2 bg-gray-50 p-6 rounded-lg shadow-md">
//             <h3 className="text-lg font-semibold text-gray-800">Pay with Card</h3>
//             <input
//               type="text"
//               placeholder="Enter your email"
//               className="w-full p-2 mt-3 border rounded-lg"
//             />
//             <input
//               type="text"
//               placeholder="Card Number"
//               className="w-full p-2 mt-3 border rounded-lg"
//             />
//             <div className="flex space-x-2 mt-3">
//               <input type="text" placeholder="MM / YY" className="w-1/2 p-2 border rounded-lg" />
//               <input type="text" placeholder="CVC" className="w-1/2 p-2 border rounded-lg" />
//             </div>
//             <input
//               type="text"
//               placeholder="Cardholder Name"
//               className="w-full p-2 mt-3 border rounded-lg"
//             />
//             <button
//               onClick={handlePayment}
//               className="w-full bg-blue-600 text-white font-semibold py-2 mt-4 rounded-lg"
//             >
//               PAY ₹500
//             </button>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Payment;
