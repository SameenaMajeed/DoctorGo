"use client"

import type React from "react"
import { useState } from "react"
import Footer from "../CommonComponents/Footer"
import Navbar from "../CommonComponents/Navbar"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setLoading } from "../../slice/user/userSlice"
// import doctorApi from "../../axios/DoctorInstance"
import { setDoctor, setError } from "../../slice/Doctor/doctorSlice"
import toast from "react-hot-toast"
import { Mail, Lock, Eye, EyeOff, Stethoscope, ArrowRight, AlertCircle } from "lucide-react"
import { createApiInstance } from "../../axios/apiService"

const doctorApi = createApiInstance("doctor");

const DoctorLogin: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setErrorState] = useState("")
  const [loading, setLoadingState] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorState("")
    dispatch(setLoading())
    setLoadingState(true)

    try {
      const response = await doctorApi.post("/login", { email, password }, { withCredentials: true })
      console.log(response.status)
      if (response.status === 200) {
        const { role, accessToken, refreshToken } = response.data.data
        dispatch(
          setDoctor({
            doctor: response.data.data,
            role,
            accessToken,
            refreshToken,
          }),
        )
        navigate("/doctor/home", { replace: true })
        toast.success("Login successful!")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      let errorMsg = "Something went wrong."
      // Handle blocked account error
      if (err.response?.status === 403) {
        const blockReason = err.response?.data?.data?.reason || "Your account has been blocked by admin."
        setErrorState(blockReason)
        dispatch(setError(blockReason))
        toast.error(blockReason)
        return
      }
      // Handle invalid credentials
      if (err.response?.data?.message === "Wrong Password.") {
        errorMsg = "Invalid email or password."
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      }
      setErrorState(errorMsg)
      dispatch(setError(errorMsg))
      toast.error(errorMsg)
    } finally {
      setLoadingState(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center flex-grow p-4 sm:p-6 lg:p-8">
        {/* Left Side - Illustration/Info */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative z-10 inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl">
                <Stethoscope className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Doctor Portal
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Access your medical practice dashboard and manage patient appointments with ease
              </p>
              <div className="flex items-center justify-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-500">Access</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">Secure</div>
                  <div className="text-sm text-gray-500">Platform</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">Easy</div>
                  <div className="text-sm text-gray-500">Management</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 lg:hidden">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your doctor account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed hover:scale-100" : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <a
                  href="/doctor/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                >
                  Register Here
                </a>
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Secure Login
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  24/7 Support
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  HIPAA Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default DoctorLogin




// import React, { useState } from "react";
// import Footer from "../CommonComponents/Footer";
// import Navbar from "../CommonComponents/Navbar";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { setLoading } from "../../slice/user/userSlice";
// import doctorApi from "../../axios/DoctorInstance";
// import { setDoctor, setError } from "../../slice/Doctor/doctorSlice";
// import toast from "react-hot-toast";

// const DoctorLogin: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setErrorState] = useState("");
//   const [loading, setLoadingState] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorState("");
//     dispatch(setLoading());
//     setLoadingState(true);

//     try {
//       const response = await doctorApi.post(
//         "/login",
//         { email, password },
//         { withCredentials: true }
//       );

//       console.log(response.status);

//       if (response.status === 200) {
//         const {  role, accessToken, refreshToken } = response.data.data;
//         dispatch(
//           setDoctor({
//             doctor: response.data.data,
//             role,
//             accessToken,
//             refreshToken,
//           })
//         );

//         navigate("/doctor/home", { replace: true });
//         toast.success("Login successful!");
//       }
//     } catch (err: any) {
//       console.error("Login error:", err);

//       let errorMsg = "Something went wrong.";

//       // Handle blocked account error
//       if (err.response?.status === 403) {
//         const blockReason =
//           err.response?.data?.data?.reason ||
//           "Your account has been blocked by admin.";
//         setErrorState(blockReason);
//         dispatch(setError(blockReason));
//         toast.error(blockReason);
//         return;
//       }

//       // Handle invalid credentials
//       if (err.response?.data?.message === "Wrong Password.") {
//         errorMsg = "Invalid email or password.";
//       } else if (err.response?.data?.message) {
//         errorMsg = err.response.data.message;
//       }

//       setErrorState(errorMsg);
//       dispatch(setError(errorMsg));
//       toast.error(errorMsg);
//     } finally {
//       setLoadingState(false);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
//           <h2 className="text-2xl font-semibold text-center text-gray-800">
//             Hello! <span className="text-blue-600">Welcome Back</span> 👋
//           </h2>

//           <form className="mt-6" onSubmit={handleLogin}>
//             <div className="mb-4">
//               <label className="block text-gray-600 text-sm mb-2">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter Your Email"
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 required
//                 autoComplete="email"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-600 text-sm mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter Your Password"
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 required
//                 autoComplete="current-password"
//               />
//             </div>

//             <button
//               type="submit"
//               className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300 ${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           {error && <p className="text-center text-red-500 mt-4">{error}</p>}

//           <p className="text-center text-gray-600 text-sm mt-4">
//             Don't have an account?{" "}
//             <a href="/doctor/signup" className="text-blue-600 hover:underline">
//               Register
//             </a>
//           </p>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default DoctorLogin;
