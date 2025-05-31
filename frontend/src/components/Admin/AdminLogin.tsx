import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../slice/Store/Store";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../slice/admin/adminSlice";
import toast from "react-hot-toast";
import { AiFillLock } from "react-icons/ai";
import { adminLoginService } from "../../Api/AdminApis";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Global loading and error state from Redux store
  const { loading, error } = useSelector((state: RootState) => state.admin);
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
  
    setLocalError(null);
  
    const { success, message, admin, accessToken, error } = await adminLoginService({
      email,
      password
    });
  
    if (success && admin && accessToken) {
      console.log('Login Response Data:', { admin, accessToken });
      
      const payload = {
        _id: admin._id,
        email: admin.email,
        accessToken,
      };
  
      console.log('Dispatching adminLogin with:', payload);
      dispatch(adminLogin(payload));
      navigate("/admin/dashboard");
      toast.success(message);
    } else {
      console.error("Login error:", error);
      setLocalError(message);
    }
  };
  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Logging in with:", { email, password });

  //   setLocalError(null); // Reset error before new request

  //   try {
  //     const response: any = await adminApi.post("/login", { email, password });
  //     console.log("Admin response received successfully:", response);

  //     const { admin, accessToken } = response.data.data;
  //     console.log('Login Response Data:', { admin, accessToken });

  //     const payload = {
  //       _id: admin._id,
  //       email: admin.email,
  //       accessToken,
  //     };

  //     console.log('Dispatching adminLogin with:', payload);
  //     dispatch(adminLogin(payload));
  //     navigate("/admin/dashboard");
  //     toast.success("Login success");
  //   } catch (error: any) {
  //     console.error("Login error:", error);

  //     // Extract the error response message from the backend
  //     const errorMessage =
  //       error.response?.data?.message ||
  //       "Invalid email or password. Please try again.";

  //     setLocalError(errorMessage);
  //   }
  // };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-500">
      <div className="bg-white/30 backdrop-blur-lg border border-white/10 shadow-lg rounded-2xl p-8 w-[400px]">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="DoctorGo" className="h-16 mb-3" />
          <h2 className="text-2xl font-semibold text-white">Admin Login</h2>
          <div className="text-white bg-white/20 p-3 rounded-full mt-3">
            <AiFillLock size={28} />
          </div>
        </div>
        {/* Show error messages */}
        {localError && (
          <p className="mb-4 text-center text-red-500">{localError}</p>
        )}
        {error && !localError && (
          <p className="mb-4 text-center text-red-500">{error}</p>
        )}

        <form onSubmit={handleLogin}>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-white"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gmail.com"
            className="mb-2 w-full px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white bg-white/70"
            required
          />

          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-white"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="mb-2 w-full px-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white bg-white/70"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg transition duration-200 shadow-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
