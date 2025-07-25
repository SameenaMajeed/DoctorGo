import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setError, setLoading } from "../../slice/user/userSlice";
import { createApiInstance } from "../../axios/apiService";
// import doctorApi from "../../axios/DoctorInstance";

const doctorApi = createApiInstance("doctor");

interface OtpModalProps {
  doctorId: string;
  newEmail: string;
  onVerify: () => void;
  onClose: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ doctorId, newEmail, onVerify, onClose }) => {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(60);

  const verifyOTP = async () => {
    try {
      const response = await doctorApi.post(`/verify-otp`, {
        doctorId,
        otp,
        newEmail,
      });

      if (response.data.message === "Email updated successfully") {
        onVerify();
        onClose();
      } else {
        setMessage("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      dispatch(setError("OTP verification failed."));
      setMessage("OTP verification failed. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    setMessage("");
    dispatch(setLoading());
    setCountdown(60);

    try {
      await doctorApi.post("/send-otp", {
        doctorId,
        newEmail,
      });
      setMessage("A new OTP has been sent to your email.");
    } catch (error: any) {
      console.error(error);
      dispatch(setError("Error resending OTP."));
      setMessage("Error resending OTP. Please try again.");
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h3 className="text-lg font-semibold">Enter OTP</h3>
        <input
          type="text"
          className="w-full p-2 border rounded-md mt-3"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <div className="mt-4 flex justify-between">
          <button
            onClick={verifyOTP}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Verify & Update
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-gray-700">
            OTP will expire in {countdown} seconds.
          </p>
          {countdown === 0 && (
            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full mt-3 py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Resend OTP
            </button>
          )}
          {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default OtpModal;