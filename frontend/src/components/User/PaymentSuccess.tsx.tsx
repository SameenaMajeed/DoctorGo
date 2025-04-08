import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Footer from "./Home/Footer";
import Navbar from "./Home/Navbar";
import confetti from "canvas-confetti";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }, // Ensures confetti is centered
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-blue-100 to-green-100">
      <Navbar />

      {/* Centered Content with Distance from Navbar */}
      <div className="flex flex-grow items-center justify-center mt-20 mb-10">
        {/* Success Message */}
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-lg mx-auto">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
          <h2 className="text-3xl font-bold text-green-600 mt-4">Payment Successful!</h2>
          <p className="text-gray-700 mt-2 text-lg">
            Thank you for your payment. Your transaction was completed successfully. 🎉
          </p>

          {/* Back to Home Button */}
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Go Back to Home
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
