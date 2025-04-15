import React, { useState } from "react";
import Footer from "../CommonComponents/Footer";
import Navbar from "../CommonComponents/Navbar";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoading } from "../../slice/user/userSlice";
import doctorApi from "../../axios/DoctorInstance";
import { setDoctor, setError } from "../../slice/Doctor/doctorSlice";
import toast from "react-hot-toast";
import { Doctor } from "../../Types";

const DoctorLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setErrorState] = useState("");
  const [loading, setLoadingState] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState("");
    dispatch(setLoading());
    setLoadingState(true);

    try {
      const response = await doctorApi.post(
        "/login",
        { email, password },
        { withCredentials: true }
      );

      console.log(response.status);

      if (response.status === 200) {
        const { doctor, role, accessToken, refreshToken } = response.data.data;
        dispatch(
          setDoctor({
            doctor: response.data.data,
            role,
            accessToken,
            refreshToken,
          })
        );

        navigate("/doctor/home", { replace: true });
        toast.success("Login successful!");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMsg = "Something went wrong.";

      // Handle blocked account error
      if (err.response?.status === 403) {
        const blockReason =
          err.response?.data?.data?.reason ||
          "Your account has been blocked by admin.";
        setErrorState(blockReason);
        dispatch(setError(blockReason));
        toast.error(blockReason);
        return;
      }

      // Handle invalid credentials
      if (err.response?.data?.message === "Wrong Password.") {
        errorMsg = "Invalid email or password.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setErrorState(errorMsg);
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Hello! <span className="text-blue-600">Welcome Back</span> 👋
          </h2>

          <form className="mt-6" onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <p className="text-center text-red-500 mt-4">{error}</p>}

          <p className="text-center text-gray-600 text-sm mt-4">
            Don't have an account?{" "}
            <a href="/doctor/signup" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DoctorLogin;
