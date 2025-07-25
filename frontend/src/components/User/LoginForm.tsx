"use client"

import type React from "react"
import { type FormEvent, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setError, setLoading, setUser } from "../../slice/user/userSlice"
// import api from "../../axios/UserInstance"
import { assets } from "../../assets/assets"
import Navbar from "../CommonComponents/Navbar"
import Footer from "../CommonComponents/Footer"
import ForgotPasswordModel from "../CommonComponents/ForgotPasswordModel"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import App from "../../FirebaseAuthentication/config"
import { toast } from "react-hot-toast"
import type { IGoogleSignInResponse } from "../../types/auth"
import { loginUser } from "../../Api/UserApis"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createApiInstance } from "../../axios/apiService"

const api = createApiInstance("user");

const LoginForm: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({ email: "", password: "" })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const validateForm = () => {
    let valid = true
    const newErrors = { email: "", password: "" }

    if (!email) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format"
      valid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")
    if (!validateForm()) return

    setIsLoading(true)
    const { success, message } = await loginUser(email, password, dispatch)

    if (success) {
      toast.success("Login successful!")
      navigate("/")
    } else if (message) {
      setMessage(message)
    }
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth(App)
    const provider = new GoogleAuthProvider()

    try {
      setIsGoogleLoading(true)
      dispatch(setLoading())

      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const response: any = await api.post<IGoogleSignInResponse>("/google", { idToken }, { withCredentials: true })

      const { user, accessToken, refreshToken } = response.data?.data

      if (user) {
        dispatch(
          setUser({
            id: user.id || "",
            name: user.name || "",
            email: user.email || "",
            mobile_no: user.mobile_no || "",
            accessToken,
            refreshToken,
          }),
        )

        toast.success("Google Sign-In successful!")
        navigate("/")
      } else {
        throw new Error("Invalid user data received")
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error)
      const errorMessage = error.response?.data?.message || "Google Sign-In failed. Please try again."
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left Side - Image */}
              <motion.div
                variants={itemVariants}
                className="lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center text-white">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <img
                      src={assets.logoImg || "/placeholder.svg?height=200&width=200"}
                      alt="DoctorGo"
                      className="w-48 h-48 mx-auto mb-8 rounded-full shadow-2xl object-cover"
                    />
                  </motion.div>
                  <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">
                    Welcome Back!
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-blue-100 text-lg leading-relaxed">
                    Access your account to book appointments with trusted healthcare professionals
                  </motion.p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              </motion.div>

              {/* Right Side - Form */}
              <motion.div variants={itemVariants} className="lg:w-1/2 p-8 sm:p-12 lg:p-16">
                <div className="max-w-md mx-auto">
                  <motion.div variants={itemVariants} className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
                    <p className="text-gray-600">Please login to book an appointment</p>
                  </motion.div>

                  <motion.form variants={itemVariants} onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          autoComplete="off"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                            errors.email
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500"
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          autoComplete="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                            errors.password
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-sm flex items-center gap-1"
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Login Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </motion.form>

                  {/* Divider */}
                  <motion.div variants={itemVariants} className="my-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Social Login & Register */}
                  <motion.div variants={itemVariants} className="space-y-4">
                    <motion.button
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => navigate("/signup")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-transparent border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Create New Account
                    </motion.button>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <p className="text-red-600 text-sm text-center">{message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <ForgotPasswordModel show={showForgotPassword} onClose={() => setShowForgotPassword(false)} role={"user"} />

      <Footer />
    </div>
  )
}

export default LoginForm





// import React, { FormEvent, useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { setError, setLoading, setUser } from "../../slice/user/userSlice";
// import api from "../../axios/UserInstance";
// import { assets } from "../../assets/assets";
// import Navbar from "../CommonComponents/Navbar";
// import Footer from "../CommonComponents/Footer";
// import ForgotPasswordModel from "../CommonComponents/ForgotPasswordModel";
// import {getAuth , signInWithPopup , GoogleAuthProvider} from "firebase/auth"
// import App from "../../FirebaseAuthentication/config";
// import { toast } from "react-hot-toast";
// import { IGoogleSignInResponse} from "../../types/auth";
// import { loginUser } from "../../Api/UserApis";

// const LoginForm: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [errors, setErrors] = useState({ email: "", password: "" });

//   const [showForgotPassword, setShowForgotPassword] = useState(false);

//   const validateForm = () => {
//     let valid = true;
//     const newErrors = { email: "", password: "" };

//     if (!email) {
//       newErrors.email = "Email is required";
//       valid = false;
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = "Invalid email format";
//       valid = false;
//     }

//     if (!password) {
//       newErrors.password = "Password is required";
//       valid = false;
//     } else if (password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters long";
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setMessage("");

//     if (!validateForm()) return;

//     const { success, message } = await loginUser(email, password, dispatch);
    
//     if (success) {
//       toast.success('Login successful!');
//       navigate("/");
//     } else if (message) {
//       setMessage(message);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     const auth = getAuth(App);
//     const provider = new GoogleAuthProvider();
  
//     try {
//       dispatch(setLoading());
  
//       const result = await signInWithPopup(auth, provider);
//       const idToken = await result.user.getIdToken();
  
//       const response : any = await api.post<IGoogleSignInResponse>('/google', { idToken }, { withCredentials: true });
  
//       console.log('Full API response:', response.data);
  
//       // Extract user correctly
//       const {user , accessToken, refreshToken } = response.data?.data; 
//       console.log('Extracted user:', user ,accessToken, );
  
//       if (user) {
//         dispatch(setUser({
//           id: user.id || "", // fallback to empty string
//           name: user.name || "",
//           email: user.email || "",
//           mobile_no: user.mobile_no || "",
//           accessToken, // Store accessToken
//           refreshToken,
//         })); 
//         toast.success('Google Sign-In successful!');
//         navigate("/");
//       } else {
//         throw new Error("Invalid user data received");
//       }
  
//     } catch (error : any) {
//       console.error('Google Sign-In Error:', error);
//       const errorMessage = error.response?.data?.message || "Google Sign-In failed. Please try again.";
//       dispatch(setError(errorMessage));
//       toast.error(errorMessage);
//     }
//   };
  

//   return (
//     <div>
//       <Navbar />
//       <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="flex w-3/4 bg-white rounded-lg shadow-lg overflow-hidden">
//           <div className="w-1/2 hidden md:block">
//             <img
//               src={assets.logoImg}
//               alt="DoctorGo"
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
//             <h1 className="text-3xl font-semibold text-gray-800 text-center mb-2">
//               Login
//             </h1>
//             <p className="text-gray-600 text-center mb-6">
//               Please login to book an appointment
//             </p>

//             <form onSubmit={handleLogin}>
//               <div className="space-y-4">
//                 <input
//                 autoComplete="off"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your Email"
//                   className={`w-full px-4 py-2 border ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-sm">{errors.email}</p>
//                 )}

//                 <input
//                 autoComplete="new-password"
//                   type="password"
//                   placeholder="Enter your Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className={`w-full px-4 py-2 border ${
//                     errors.password ? "border-red-500" : "border-gray-300"
//                   } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400`}
//                 />
//                 {errors.password && (
//                   <p className="text-red-500 text-sm">{errors.password}</p>
//                 )}
//               </div>
//               <div className="mt-6 flex flex-col space-y-3">
//               <button
//                 type="submit"
//                 className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
//               >
//                 Login
//               </button>
//               </div>
//             </form>

//             <div className="flex justify-between items-center mt-4 text-sm">
//               <label className="flex items-center space-x-2 text-gray-600">
//                 <input type="checkbox" className="accent-blue-500" />
//                 <span>Remember Me</span>
//               </label>
//               <button
//                 onClick={() => setShowForgotPassword(true)}
//                 className="text-blue-500 cursor-pointer hover:underline"
//               >
//                 Forgot Password?
//               </button>
//             </div>
//             <ForgotPasswordModel
//               show={showForgotPassword}
//               onClose={() => setShowForgotPassword(false)}
//               role={"user"}
//             />

//             <div className="mt-6 flex flex-col space-y-3">
//             <p className="font-serif text-sepia-700 mb-2">Or sign in with:</p>
//               <button
//                 onClick={handleGoogleSignIn}
//                 type="submit"
//                 className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
//               >
//                 Sign in with Google
//               </button>
//               <button
//                 type="button"
//                 onClick={()=>navigate('/signup')}
//                 className="w-full border border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
//               >
//                 Register
//               </button>
//             </div>

//             {message && (
//               <p className="text-center text-red-500 mt-4">{message}</p>
//             )}
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default LoginForm;
