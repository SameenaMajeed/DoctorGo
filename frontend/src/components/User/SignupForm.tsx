"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCheck } from "lucide-react";
// import api from "../../axios/UserInstance";
// import { setError, setLoading } from "../../slice/user/userSlice";
// import { assets } from "../../assets/assets";
// import sendOtp from "../../Utils/sentOtp";
import OtpModal from "../../components/CommonComponents/OtpModal";
import Navbar from "../CommonComponents/Navbar";
import Footer from "../CommonComponents/Footer";
import { registerUser } from "../../Api/UserApis";
import { sendOtp } from "../../Api/OtpApis";

interface ISignupFormInputs {
  name: string;
  email: string;
  gender: string;
  password: string;
  confirmPassword: string;
  mobileNo: string;
}

const validationSchema = yup.object({
  name: yup
    .string()
    .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed")
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm Password is required"),
  mobileNo: yup
    .string()
    .matches(/^\d{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  gender: yup.string().required("Gender is required"),
});

const SignupForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ISignupFormInputs>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: ISignupFormInputs) => {
    setMessage("");
    try {
      const { success, message: otpMessage } = await sendOtp(
        data.email,
        dispatch
      );
      setMessage(otpMessage);
      if (success) setShowOtpModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpSuccess = async (successMessage: string) => {
    setMessage(successMessage);
    setShowOtpModal(false);
    const data = getValues();
    try {
      await registerUser(
        {
          name: data.name,
          email: data.email,
          password: data.password,
          mobile_no: data.mobileNo,
          gender: data.gender,
        },
        dispatch
      );

      setMessage("User registered successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("Error registering user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center flex-grow p-4 sm:p-6 lg:p-8">
        {/* Illustration */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <img
              src="/registration.jpg"
              alt="Signup Illustration"
              className="relative z-10 max-w-full h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Join us today and book your appointment with ease
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name and email*/}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Controller
                      name="name"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter your full name"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                            errors.name
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        />
                      )}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Controller
                      name="email"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          placeholder="Enter your email address"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                            errors.email
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        />
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile and Gender Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile No */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Controller
                      name="mobileNo"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="10-digit number"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                            errors.mobileNo
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        />
                      )}
                    />
                  </div>
                  {errors.mobileNo && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.mobileNo.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Gender
                  </label>
                  <Controller
                    name="gender"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors.gender
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors.password
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Controller
                    name="confirmPassword"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors.confirmPassword
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98]"
              >
                Create Account
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <p className="text-center text-sm font-medium text-amber-800 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  {message}
                </p>
              </div>
            )}

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showOtpModal && (
        <OtpModal
          email={getValues("email")}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          show={showOtpModal}
        />
      )}
    </div>
  );
};

export default SignupForm;

// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useForm, Controller } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// // import api from "../../axios/UserInstance";
// // import { setError, setLoading } from "../../slice/user/userSlice";
// // import { assets } from "../../assets/assets";
// // import sendOtp from "../../Utils/sentOtp";
// import OtpModal from "../../components/CommonComponents/OtpModal";
// import Navbar from "../CommonComponents/Navbar";
// import Footer from "../CommonComponents/Footer";
// import { registerUser } from "../../Api/UserApis";
// import { sendOtp } from "../../Api/OtpApis";

// interface ISignupFormInputs {
//   name: string;
//   email: string;
//   gender: string;
//   password: string;
//   confirmPassword: string;
//   mobileNo: string;
// }

// const validationSchema = yup.object({
//   name: yup
//     .string()
//     .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed")
//     .min(3, "Name must be at least 3 characters")
//     .required("Name is required"),
//   email: yup
//     .string()
//     .email("Invalid email format")
//     .required("Email is required"),
//   password: yup
//     .string()
//     .min(6, "Password must be at least 8 characters")
//     .matches(/[A-Z]/, "Must contain at least one uppercase letter")
//     .matches(/[a-z]/, "Must contain at least one lowercase letter")
//     .matches(/[0-9]/, "Must contain at least one number")
//     .matches(
//       /[!@#$%^&*(),.?":{}|<>]/,
//       "Must contain at least one special character"
//     )
//     .required("Password is required"),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref("password")], "Passwords do not match")
//     .required("Confirm Password is required"),
//   mobileNo: yup
//     .string()
//     .matches(/^\d{10}$/, "Mobile number must be 10 digits")
//     .required("Mobile number is required"),
//   gender: yup.string().required("Gender is required"),
// });

// const SignupForm: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [message, setMessage] = useState("");
//   const [showOtpModal, setShowOtpModal] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     getValues,
//     formState: { errors },
//   } = useForm<ISignupFormInputs>({
//     resolver: yupResolver(validationSchema),
//   });

//   const onSubmit = async (data: ISignupFormInputs) => {
//     setMessage("");
//     try {
//       const { success, message: otpMessage } = await sendOtp(data.email, dispatch);
//       setMessage(otpMessage);
//       if (success) setShowOtpModal(true);
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       setMessage("Failed to send OTP. Please try again.");
//     }
//   };

//   const handleOtpSuccess = async (successMessage: string) => {
//     setMessage(successMessage);
//     setShowOtpModal(false);
//     const data = getValues();

//     try {
//       await registerUser({
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         mobile_no: data.mobileNo,
//         gender: data.gender
//       }, dispatch);

//       setMessage("User registered successfully!");
//       navigate("/login");
//     } catch (error) {
//       console.error("Error registering user:", error);
//       setMessage("Error registering user. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />

//        {/* Main Content */}
//        <div className="flex flex-col md:flex-row items-center justify-center flex-grow p-6 mt-8">
//         {/* Illustration */}
//         <div className="hidden md:block w-1/2">
//           <img
//             src="/registration.jpg"
//             alt="Signup Illustration"
//             className="max-w-full"
//           />
//         </div>

//         <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-8">
//           <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
//             Create Account
//           </h1>
//           <p className="text-gray-500 mb-6">
//             Please sign up to book an appointment
//           </p>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Full Name
//               </label>
//               <Controller
//                 name="name"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your name"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.name && (
//                 <p className="text-red-600 text-sm">{errors.name.message}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-gray-700 font-medium">Email</label>
//               <Controller
//                 name="email"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="email"
//                     placeholder="Enter your email"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.email && (
//                 <p className="text-red-600 text-sm">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Mobile No */}
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Phone No
//               </label>
//               <Controller
//                 name="mobileNo"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your mobile number"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.mobileNo && (
//                 <p className="text-red-600 text-sm">
//                   {errors.mobileNo.message}
//                 </p>
//               )}
//             </div>

//             {/* Gender */}
//             <div>
//               <label className="block text-gray-700 font-medium">Gender</label>
//               <Controller
//                 name="gender"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <select
//                     {...field}
//                     className="w-full px-3 py-2 border rounded"
//                   >
//                     <option value="">Select</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                   </select>
//                 )}
//               />
//               {errors.gender && (
//                 <p className="text-red-600 text-sm">{errors.gender.message}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Password
//               </label>
//               <Controller
//                 name="password"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="password"
//                     placeholder="Enter your password"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.password && (
//                 <p className="text-red-600 text-sm">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Confirm Password
//               </label>
//               <Controller
//                 name="confirmPassword"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="password"
//                     placeholder="Confirm your password"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.confirmPassword && (
//                 <p className="text-red-600 text-sm">
//                   {errors.confirmPassword.message}
//                 </p>
//               )}
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-3 mt-5 rounded-lg text-lg font-semibold"
//             >
//               Create Account
//             </button>
//           </form>
//           {message && (
//             <p className="mt-4 text-center text-sm font-medium text-[#8b5d3b]">
//               {message}
//             </p>
//           )}
//         </div>
//       </div>

//       <Footer/>
//       {showOtpModal && (
//         <OtpModal
//           email={getValues("email")}
//           onClose={() => setShowOtpModal(false)}
//           onSuccess={handleOtpSuccess}
//           show={showOtpModal}
//         />
//       )}
//     </div>
//   );
// };

// export default SignupForm;
