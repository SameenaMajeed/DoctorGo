import { useState } from "react";
import userApi from '../../axios/UserInstance'
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface NewPasswordModalProps {
    show: boolean;
    email: string;
    onClose: () => void;
    role: string;
  }

const NewPasswordModal: React.FC<NewPasswordModalProps> = ({ show, email, onClose, role }) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const navigate = useNavigate()

  const handleNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long.");
      return;
    }

     // Validation for empty fields
     if (!newPassword || !confirmPassword) {
        toast.error('Both fields are required.');
        return;
      }
  
      // Validation for matching passwords
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }

    try {
      const response = await userApi.post<{ success: boolean; message?: string }>("/reset-password", {
        email,
        password : newPassword,
      });

      if (response.data.success) {
        toast.success('Password reset successfully! You can now log in.');
        navigate('/login')
        setTimeout(() => {
          onClose(); // Close the modal after a short delay
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      
        // Capture custom backend errors (like same password issue)
        toast.error(error.response.data.message || 'Invalid request.');
      
    }
  };

  if (!show) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Confirm Password</h2>

        <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter New Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Confirm
          </button>
        </form>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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
      </div>
    </div>
  );
};

export default NewPasswordModal;
