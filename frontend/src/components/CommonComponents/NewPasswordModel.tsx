import { useState } from "react";
import userApi from "../../axios/UserInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface NewPasswordModalProps {
  show: boolean;
  email: string;
  onClose: () => void;
  role: string;
}

const NewPasswordModal: React.FC<NewPasswordModalProps> = ({
  show,
  email,
  onClose,
  role,
}) => {
  console.log(email , role)
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const navigate = useNavigate();

  const handleNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Both fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await userApi.post<{ success: boolean; message?: string }>(
        "/reset-password",
        {
          email,
          password: newPassword,
        }
      );

      console.log(response.data)

      if (response.data.success) {
        toast.success("Password reset successfully! You can now log in.");
        setTimeout(() => {
          navigate("/login");
          onClose();
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid request.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 animate-fadeIn relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-transform transform hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Set a new password for your account.
        </p>

        {/* Form */}
        <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              placeholder="Enter New Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg hover:opacity-90 transition-shadow shadow-md hover:shadow-lg"
          >
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordModal;
