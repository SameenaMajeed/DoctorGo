"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { setError, setLoading, setDoctor } from "../../slice/Doctor/doctorSlice"
import sendOtp from "../../Utils/sentOtp"
import OtpModal from "../../components/CommonComponents/OtpModal"
import Navbar from "../CommonComponents/Navbar"
import Footer from "../CommonComponents/Footer"
import type { RootState } from "../../slice/Store/Store"
import doctorApi from "../../axios/DoctorInstance"
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react"

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm Password is required"),
  phone: yup.string().required("Mobile number is required"),
  qualification: yup.string().required("Qualification is required"),
  specialization: yup.string().required("Specialization is required"),
  registrationNumber: yup.string().required("Medical registration number is required"),
  certificationFile: yup
    .mixed<File>()
    .required("Certificate is required")
    .test("fileFormat", "Unsupported file format. Only PDF, PNG, and JPG are allowed.", (value: File | undefined) => {
      if (value) {
        const supportedFormats = ["application/pdf", "image/png", "image/jpeg"]
        return supportedFormats.includes(value.type)
      }
      return false
    }),
})

type FormData = yup.InferType<typeof validationSchema>

const DoctorSignupForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { error } = useSelector((state: RootState) => state.doctor)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(setError(""))

    // Clear any form-related state if needed
    return () => {
      dispatch(setError(""))
    }
  }, [dispatch])

  useEffect(() => {
    return () => {
      dispatch(setError(""))
    }
  }, [dispatch])

  const onSubmit = async (data: FormData) => {
    setFormData(data)
    const result = await sendOtp(data.email, dispatch)
    if (result.success) {
      setShowOtpModal(true)
    }
  }

  const completeSingUp = async () => {
    if (!formData || !formData.certificationFile) return

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "confirmPassword") {
        if (value instanceof File) {
          formDataToSend.append(key, value)
        } else {
          formDataToSend.append(key, value.toString())
        }
      }
    })

    // Set initial approval status to pending
    formDataToSend.append("isApproved", "false")
    formDataToSend.append("approvalStatus", "pending")

    try {
      dispatch(setLoading())
      const response: any = await doctorApi.post("/signup", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log("response", response)

      dispatch(
        setDoctor({
          ...response.data.doctor,
          isApproved: false,
          approvalStatus: "pending",
        }),
      )

      setShowOtpModal(false)

      // Redirect to doctor home page
      navigate("/doctor/login")
    } catch (err: any) {
      dispatch(setError(err.response?.data?.error || "Signup failed"))
    }
  }

  const handleFileChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
    if (file) {
      setUploadedFile(file)
      onChange(file)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-start justify-center flex-grow p-4 sm:p-6 lg:p-8 mt-4">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <img
                src="/registration.jpg"
                alt="Doctor Registration"
                className="relative z-10 max-w-full h-auto drop-shadow-2xl rounded-2xl"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Join Our Medical Network
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Connect with patients and grow your practice with our comprehensive healthcare platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-2xl lg:max-w-3xl">
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium mb-2">
                <Users className="w-4 h-4" />
                Join 125,000+ doctors
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600">Start your journey with our medical platform</p>
            </div>

            {/* Error Display */}
            {error && error.trim() && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-red-700 text-sm">
                  {error.split(", ").map((msg, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>

                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <input
                            type="text"
                            {...field}
                            placeholder="Enter your full name"
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                              errors.name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
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
                    <label className="block text-sm font-semibold text-gray-700">Email Address</label>
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
                            placeholder="Enter your email"
                            value={field.value || ""} // Ensure empty value if undefined
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                              errors.email ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
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

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Controller
                      name="phone"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter your mobile number"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                            errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                        />
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Professional Information
                </h3>

                {/* Qualification and Specialization Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Qualification */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Qualification</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Controller
                        name="qualification"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., MBBS, MD"
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                              errors.qualification
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          />
                        )}
                      />
                    </div>
                    {errors.qualification && (
                      <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.qualification.message}
                      </p>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Specialization</label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Controller
                        name="specialization"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., Cardiology, Pediatrics"
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                              errors.specialization
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          />
                        )}
                      />
                    </div>
                    {errors.specialization && (
                      <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.specialization.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Registration Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Medical Registration Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Controller
                      name="registrationNumber"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter your medical registration number"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                            errors.registrationNumber
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        />
                      )}
                    />
                  </div>
                  {errors.registrationNumber && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.registrationNumber.message}
                    </p>
                  )}
                </div>

                {/* Medical Certification File */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Medical Certification Document</label>
                  <Controller
                    name="certificationFile"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-3">
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                            errors.certificationFile
                              ? "border-red-300 bg-red-50"
                              : uploadedFile
                                ? "border-green-300 bg-green-50"
                                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          <input
                            type="file"
                            id="certificate"
                            onChange={(e) => handleFileChange(e.target.files?.[0], field.onChange)}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-center">
                            {uploadedFile ? (
                              <div className="space-y-2">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                                <div>
                                  <p className="font-medium text-green-700">{uploadedFile.name}</p>
                                  <p className="text-sm text-green-600">{formatFileSize(uploadedFile.size)}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <div>
                                  <p className="font-medium text-gray-700">Click to upload your certificate</p>
                                  <p className="text-sm text-gray-500">PDF, JPG, JPEG, PNG up to 10MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Upload your medical license or certification document for verification
                        </p>
                      </div>
                    )}
                  />
                  {errors.certificationFile && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.certificationFile.message?.toString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Security Information
                </h3>

                {/* Password Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
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
                              errors.password ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                          />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
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
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98]"
              >
                Create Account
              </button>

              {/* Login Link */}
              <div className="text-center">
                <div className="text-gray-400 text-sm my-4">OR</div>
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/doctor/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                  >
                    Login here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />

      {showOtpModal && formData && (
        <OtpModal
          email={formData.email}
          show={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={completeSingUp}
        />
      )}
    </div>
  )
}

export default DoctorSignupForm





// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { useForm, Controller } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import {
//   setError,
//   setLoading,
//   setDoctor,
// } from "../../slice/Doctor/doctorSlice";
// import sendOtp from "../../Utils/sentOtp";
// import OtpModal from "../../components/CommonComponents/OtpModal";
// import Navbar from "../CommonComponents/Navbar";
// import Footer from "../CommonComponents/Footer";
// import { RootState } from "../../slice/Store/Store";
// import doctorApi from "../../axios/DoctorInstance";

// const validationSchema = yup.object().shape({
//   name: yup.string().required("Name is required"),
//   email: yup
//     .string()
//     .email("Invalid email format")
//     .required("Email is required"),
//   password: yup.string().required("Password is required"),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref("password")], "Passwords do not match")
//     .required("Confirm Password is required"),
//   phone: yup.string().required("Mobile number is required"),
//   qualification: yup.string().required("Qualification is required"),
//   specialization: yup.string().required("Specialization is required"),
//   registrationNumber: yup
//     .string()
//     .required("Medical registration number is required"),
//     certificationFile: yup
//     .mixed<File>()
//     .required("Certificate is required")
//     .test(
//       "fileFormat",
//       "Unsupported file format. Only PDF, PNG, and JPG are allowed.",
//       (value: File | undefined) => {
//         if (value) {
//           const supportedFormats = ["application/pdf", "image/png", "image/jpeg"];
//           return supportedFormats.includes(value.type);
//         }
//         return false;
//       }
//     ),
// });

// type FormData = yup.InferType<typeof validationSchema>;

// const DoctorSignupForm: React.FC = () => {
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: yupResolver(validationSchema),
//   });

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { error } = useSelector((state: RootState) => state.doctor);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [formData, setFormData] = useState<FormData | null>(null);

//   useEffect(() => {
//     return () => {
//       dispatch(setError(""));
//     };
//   }, [dispatch]);

//   const onSubmit = async (data: FormData) => {
  
//     setFormData(data);
  
//     const result = await sendOtp(data.email, dispatch);
//     if (result.success) {
//       setShowOtpModal(true);
//     }
//   };

//   const completeSingUp = async () => {
//     if (!formData || !formData.certificationFile) return;
  
//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (key !== "confirmPassword") {
//         if (value instanceof File) {
//           formDataToSend.append(key, value);
//         } else {
//           formDataToSend.append(key, value.toString());
//         }
//       }
//     });

//     // // // Add file (ensure it's a Blob)
//     // // if (formData.certificationFile) {
//     //   formDataToSend.append("certificationFile", formData.certificationFile);
//     // // }
  
//     // Set initial approval status to pending
//     formDataToSend.append("isApproved", "false");
//     formDataToSend.append("approvalStatus", "pending");
  
//     try {
//       dispatch(setLoading());
//       const response: any = await doctorApi.post("/signup", formDataToSend, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       console.log('response',response )
  
//       dispatch(
//         setDoctor({
//           ...response.data.doctor,
//           isApproved: false,
//           approvalStatus: "pending",
//         })
//       );
  
//       setShowOtpModal(false);
  
//       // Redirect to doctor home page
//       navigate("/doctor/login");
//     } catch (err: any) {
//       dispatch(setError(err.response?.data?.error || "Signup failed"));
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />
//       <div className="flex flex-col md:flex-row items-center justify-center flex-grow p-6 mt-20">
//         <div className="hidden md:block w-1/2">
//           <img
//             src="/registration.jpg"
//             alt="Signup Illustration"
//             className="max-w-full"
//           />
//         </div>
//         <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-8">
//           <p className="text-gray-500 text-sm mb-4">Join 125,000+ doctors</p>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Create Account
//           </h2>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
//                     type="text"
//                     {...field}
//                     placeholder="Enter your name"
//                     className="w-full px-3 py-2 border rounded mb-3"
//                   />
//                 )}
//               />
//               {errors.name && (
//                 <p className="text-red-600 text-sm">{errors.name.message}</p>
//               )}
//             </div>

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

//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Qualification
//               </label>
//               <Controller
//                 name="qualification"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your qualification"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.qualification && (
//                 <p className="text-red-600 text-sm">
//                   {errors.qualification.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Specialization
//               </label>
//               <Controller
//                 name="specialization"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your specialization"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.specialization && (
//                 <p className="text-red-600 text-sm">
//                   {errors.specialization.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Medical Registration Number
//               </label>
//               <Controller
//                 name="registrationNumber"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your registration number"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.registrationNumber && (
//                 <p className="text-red-600 text-sm">
//                   {errors.registrationNumber.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Medical Certification Document
//               </label>
//               <Controller
//                 name="certificationFile"
//                 control={control}
//                 render={({ field }) => (
//                   <input
//                     type="file"
//                     id="certificate"
//                     onChange={(e) => {field.onChange(e.target.files?.[0])}
//                     }
//                     accept=".pdf,.jpg,.jpeg,.png"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Upload your medical license or certification (PDF, JPG, JPEG,
//                 PNG)
//               </p>
//               {errors.certificationFile && (
//                 <p className="text-red-600 text-sm">
//                   {errors.certificationFile.message?.toString()}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Phone No
//               </label>
//               <Controller
//                 name="phone"
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
//               {errors.phone && (
//                 <p className="text-red-600 text-sm">{errors.phone.message}</p>
//               )}
//             </div>

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
//               className="w-full bg-blue-600 text-white py-2 rounded-lg"
//             >
//               Create account
//             </button>

//             <div className="text-center text-gray-500 text-sm my-4">OR</div>

//             <p className="text-sm text-gray-500 text-center mt-4">
//               Already have an account?{" "}
//               <a href="/doctor/login" className="text-blue-600">
//                 Login here
//               </a>
//             </p>
//           </form>

//           {error && (
//             <p className="text-red-500 text-sm mb-4">
//               {error.split(", ").map((msg, i) => (
//                 <span key={i}>
//                   • {msg}
//                   <br />
//                 </span>
//               ))}
//             </p>
//           )}
//         </div>
//       </div>
//       <Footer />
//       {showOtpModal && formData && (
//         <OtpModal
//           email={formData.email}
//           show={showOtpModal}
//           onClose={() => setShowOtpModal(false)}
//           onSuccess={completeSingUp}
//         />
//       )}
//     </div>
//   );
// };

// export default DoctorSignupForm;
