import React, { useState } from "react";
import Footer from "../CommonComponents/Footer";
import Navbar from "../CommonComponents/Navbar";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoading } from "../../slice/user/userSlice";
import doctorApi from "../../axios/DoctorInstance";
import { setDoctor, setError } from "../../slice/Doctor/doctorSlice";
import toast from "react-hot-toast";

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
    const response: any = await doctorApi.post(
      "/login",
      { email, password },
      { withCredentials: true }
    );
    if (response.data.success) {
      dispatch(setDoctor(response.data.data));
      navigate("/doctor/home", { replace: true }); 
      toast.success("Login successful!");
    }
  } catch (err: any) {
    console.log("Error response data:", err.response?.data);

    let errorMsg = "Something went wrong.";

    // Handle blocked account error
    if (err.response?.status === 403) {
      const blockReason = err.response?.data?.data?.reason || "Your account has been blocked by admin.";
      setErrorState(blockReason); // Show the block reason in UI
      dispatch(setError(blockReason));
      toast.error(blockReason);
      return; // Exit early after handling the block
    }

    if (err.response?.data?.message === "Wrong Password.") {
      errorMsg = "Invalid email or password.";
    }

    setErrorState(errorMsg);
    dispatch(setError(errorMsg));
    toast.error(errorMsg);
  } finally {
    setLoadingState(false);
  }
};


  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setErrorState("");
  //   dispatch(setLoading());
  //   setLoadingState(true);
  
  //   try {
  //     const response: any = await doctorApi.post(
  //       "/login",
  //       { email, password },
  //       { withCredentials: true }
  //     );
  //     if (response.data.success) {
  //       dispatch(setDoctor(response.data.data));
  
  //       // Handle Doctor approval status
  //       if (!response.data.data.isApproved) {
  //         navigate("/doctor/pending-approval", {
  //           state: { message: "Your account is pending approval by the admin." },
  //           replace: true,
  //         });
  //         return;
  //       }
  
  //       navigate("/doctor/home", { replace: true });
  //       toast.success("Login successful!");
  //     }
  //   } catch (err: any) {
  //     console.log("Error response data:", err.response?.data);
  
  //     let errorMsg = "Something went wrong.";
  
  //     // Handle blocked account error
  //     if (err.response?.status === 403) {
  //       const blockReason = err.response?.data?.data?.reason;
  //       navigate("/doctor/pending-approval", {
  //         state: { blockReason },
  //         replace: true,
  //       });
  //       return; // Exit early after handling block
  //     }
  
  //     // Handle invalid credentials
  //     if (err.response?.data?.message === "Wrong Password.") {
  //       errorMsg = "Invalid email or password.";
  //     }
  
  //     // Set error state only if not already handled
  //     setErrorState(errorMsg);
  //     dispatch(setError(errorMsg));
  //     toast.error(errorMsg);
  //   } finally {
  //     setLoadingState(false);
  //   }
  // };
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Hello! <span className="text-blue-600">Welcome Back</span> 👋
          </h2>

          {/* Form */}
          <form className="mt-6" onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">Email</label>
              <input
              autoComplete="off"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 text-sm mb-2">
                Password
              </label>
              <input
              autoComplete="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300 ${
                loading ? "opacity-50" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && (
              <p className="text-center text-red-500 mt-4">{error}</p>
          )}

          {/* Register Link */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Don’t have an account?{" "}
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
