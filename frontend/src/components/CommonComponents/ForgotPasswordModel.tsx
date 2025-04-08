import { useState, useEffect } from "react";
import userApi from "../../axios/UserInstance";
import OtpModal from "./OtpModal";
import NewPasswordModal from "./NewPasswordModel";

interface ForgotPasswordModelProps {
  show: boolean;
  onClose: () => void;
  role: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

const ForgotPasswordModel: React.FC<ForgotPasswordModelProps> = ({
  show,
  onClose,
  role,
}) => {
  const [forgotEmail, setForgotEmail] = useState("");
  const [email, setEmail] = useState<string>("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage("");

    if (!forgotEmail) {
      setForgotMessage("Email is required.");
      return;
    }

    try {
      const response = await userApi.post<ForgotPasswordResponse>(
        "/forgot-password",
        { email: forgotEmail }
      );
      if (response.data.success) {
        setForgotMessage("OTP sent successfully to your email.");
        setEmail(forgotEmail); // Store the email for future use
        setShowOtpModal(true); // Show the OTP Modal for verification
      } else {
        setForgotMessage(response.data.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      setForgotMessage("An error occurred. Please try again.");
    }
  };

  const handleOtpVerificationSuccess = () => {
    setShowOtpModal(false);
    setOtpVerified(true); // Set OTP as verified
  };

  // Open new password modal only after OTP is verified
  useEffect(() => {
    if (otpVerified) {
      setTimeout(() => setShowNewPasswordModal(true), 300); // Add delay to prevent UI flicker
    }
  }, [otpVerified]);

  if (!show) return null; // Hide modal when `show` is false

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      {/* Forgot Password Modal */}
      {!showOtpModal && !showNewPasswordModal && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          >
            ✖
          </button>
          <h2 className="text-2xl font-bold text-center mb-4">
            Forgot Password
          </h2>
          <p className="text-center text-gray-600 mb-6">
            No worries! Enter your registered email below, and we'll send you
            instructions to reset your password.
          </p>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Enter Email Address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Send Email
            </button>
          </form>
          {forgotMessage && (
            <p className="mt-4 text-center text-sm font-medium text-red-700">
              {forgotMessage}
            </p>
          )}
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          show={showOtpModal}
          email={email}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpVerificationSuccess}
        />
      )}

      {/* New Password Modal */}
      {showNewPasswordModal && (
        <NewPasswordModal
          show={showNewPasswordModal}
          email={email}
          onClose={() => setShowNewPasswordModal(false)}
          role={role}
        />
      )}
    </div>
  );
};

export default ForgotPasswordModel;
