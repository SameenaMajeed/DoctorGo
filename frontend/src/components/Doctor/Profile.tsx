"use client"

import type React from "react"
import { type ChangeEvent, useEffect, useState } from "react"
import {
  Camera,
  CheckCircle,
  Edit,
  User,
  Phone,
  Mail,
  GraduationCap,
  Stethoscope,
  FileText,
  Clock,
  Calendar,
  X,
  Upload,
  File,
  Download,
  Trash2,
  Award,
  Shield,
  IndianRupee,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import type { RootState } from "../../slice/Store/Store"
import { setError, setLoading } from "../../slice/user/userSlice"
import doctorApi from "../../axios/DoctorInstance"
import { setProfile, updateProfilePicture } from "../../slice/Doctor/doctorSlice"
import { useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useNavigate } from "react-router-dom"
import OtpModal from "../CommonComponents/OtpEmailModal"
import toast from "react-hot-toast"
import type { IProfilePictureResponse } from "../../types/auth"

// Enhanced Validation Schema
const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  qualification: yup.string().required("Qualification is required"),
  specialization: yup.string().required("Specialization is required"),
  registrationNumber: yup
    .string()
    .required("Medical registration number is required")
    .min(5, "Registration number must be at least 5 characters"),
  ticketPrice: yup
    .number()
    .typeError("Consultation fee must be a number")
    .required("Consultation fee is required")
    .min(0, "Consultation fee cannot be negative"),
  extraCharge: yup.number().typeError("Extra fee must be a number").min(0, "Extra fee cannot be negative"),
  bio: yup.string().max(500, "Bio cannot exceed 500 characters"),
  experience: yup
    .number()
    .typeError("Experience must be a number")
    .required("Experience is required")
    .min(0, "Experience cannot be negative"),
})

type FormData = yup.InferType<typeof profileSchema>

interface Certificate {
  _id: string
  name: string
  url: string
  uploadedAt: string
  type: string
}

const Profile: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { doctor, profile, loading, error } = useSelector((state: RootState) => state.doctor)

  const [editMode, setEditMode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState(false)
  const [activeTab, setActiveTab] = useState<"personal" | "professional" | "financial" | "documents">("personal")
  const [uploadLoading, setUploadLoading] = useState(false)

  // Certificate upload states
  const [selectedCertificate, setSelectedCertificate] = useState<File | null>(null)
  const [certificateUploading, setCertificateUploading] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      qualification: profile?.qualification || "",
      specialization: profile?.specialization || "",
      registrationNumber: profile?.registrationNumber || "",
      ticketPrice: profile?.ticketPrice || 0,
      extraCharge: profile?.extraCharge || 0,
      bio: profile?.bio || "",
      experience: profile?.experience || 0,
    },
  })

  // Fetch profile data
  useEffect(() => {
    if (!doctor) {
      dispatch(setError("Doctor not logged in"))
      return
    }

    const fetchProfile = async () => {
      try {
        dispatch(setLoading())
        const response = await doctorApi.get(`/profile/${doctor._id}`)
        if (!response.data.data._id) {
          throw new Error("Invalid profile data: _id is missing")
        }
        dispatch(setProfile(response.data.data))
        reset(response.data.data)

        // Set certificates if they exist
        if (response.data.data.certificates) {
          setCertificates(response.data.data.certificates)
        }
      } catch (err) {
        dispatch(setError("Failed to fetch doctor profile."))
        console.error(err)
      }
    }

    fetchProfile()
  }, [dispatch, doctor, reset, updateTrigger])

  const handleSave = async (data: FormData) => {
    try {
      if (data.email !== profile?.email) {
        setNewEmail(data.email)
        await doctorApi.post(`/send-otp`, {
          doctorId: doctor?._id,
          newEmail: data.email,
        })
        setOtpSent(true)
        return
      }

      const response = await doctorApi.put(`/updateProfile/${doctor?._id}`, data)
      dispatch(setProfile(response.data.updatedProfile))
      reset(response.data.updatedProfile)
      setEditMode(false)
      setUpdateTrigger((prev) => !prev)
      toast.success("Profile updated successfully!")
    } catch (err) {
      console.error("Profile update failed:", err)
      dispatch(setError("Profile update failed."))
      toast.error("Failed to update profile")
    }
  }

  const handleVerifySuccess = () => {
    if (profile?._id) {
      dispatch(setProfile({ ...profile, email: newEmail }))
    }
    setOtpSent(false)
    setEditMode(false)
    navigate("/doctor/profile")
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setPreview(previewURL)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.")
      return
    }

    const formData = new FormData()
    formData.append("profilePicture", selectedFile)

    try {
      setUploadLoading(true)
      const response = await doctorApi.post<IProfilePictureResponse>("/uploadProfilePicture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const uploadedImageUrl: any = response.data.data?.profilePicture
      toast.success("Profile picture uploaded successfully")
      dispatch(updateProfilePicture(uploadedImageUrl))
      setSelectedFile(null)
      setPreview(null)
    } catch (error: unknown) {
      console.error("Error uploading profile picture:", error)
      toast.error("Failed to upload profile picture.")
    } finally {
      setUploadLoading(false)
    }
  }

  // Certificate handling functions
  const handleCertificateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload PDF, JPEG, or PNG files only")
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB")
        return
      }

      setSelectedCertificate(file)
    }
  }

  const handleCertificateUpload = async () => {
    if (!selectedCertificate) {
      toast.error("Please select a certificate to upload.")
      return
    }

    const formData = new FormData()
    formData.append("certificate", selectedCertificate)
    formData.append("doctorId", doctor?._id || "")

    try {
      setCertificateUploading(true)
      const response = await doctorApi.post("/uploadCertificate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log(response)

      toast.success("Certificate uploaded successfully")
      setSelectedCertificate(null)

      // Refresh certificates list
      const updatedProfile = await doctorApi.get(`/profile/${doctor?._id}`)
      if (updatedProfile.data.data.certificates) {
        setCertificates(updatedProfile.data.data.certificates)
      }
    } catch (error: unknown) {
      console.error("Error uploading certificate:", error)
      toast.error("Failed to upload certificate.")
    } finally {
      setCertificateUploading(false)
    }
  }

  const handleDeleteCertificate = async (certificateId: string) => {
    try {
      await doctorApi.delete(`/certificate/${certificateId}`)
      toast.success("Certificate deleted successfully")

      // Remove from local state
      setCertificates((prev) => prev.filter((cert) => cert._id !== certificateId))
    } catch (error) {
      console.error("Error deleting certificate:", error)
      toast.error("Failed to delete certificate")
    }
  }

  const handleDownloadCertificate = (certificateUrl: string, certificateName: string) => {
    const link = document.createElement("a")
    link.href = certificateUrl
    link.download = certificateName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "professional", label: "Professional", icon: Stethoscope },
    { id: "financial", label: "Financial", icon: IndianRupee},
    { id: "documents", label: "Documents", icon: File },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-8">
              {/* Profile Picture Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative w-32 h-32 mx-auto">
                    {profile?.profilePicture || preview ? (
                      <img
                        src={preview || profile?.profilePicture || ""}
                        alt="Doctor Profile"
                        className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-700 object-cover shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-xl">
                        <User size={48} className="text-white" />
                      </div>
                    )}

                    <motion.label
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      htmlFor="file-upload"
                      className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Camera size={16} />
                    </motion.label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </motion.div>
                </div>

                {/* Upload Button */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpload}
                      disabled={uploadLoading}
                      className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-shadow disabled:opacity-50"
                    >
                      {uploadLoading ? "Uploading..." : "Upload Picture"}
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Doctor Info */}
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Dr. {profile?.name || "Name"}
                  </h2>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                    {profile?.specialization || "Specialization"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {profile?.qualification || "Qualification"}
                  </p>
                  {profile?.registrationNumber && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                      <Shield size={14} />
                      <span>Reg: {profile.registrationNumber}</span>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile?.experience || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Years Experience</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-2xl p-4">
                    <div className="flex items-center justify-center mb-2">
                      <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{profile?.ticketPrice || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Consultation Fee</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <Award size={16} />
                    <span className="text-sm font-medium">
                      {certificates.length > 0 ? "Verified Doctor" : "Pending Verification"}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {certificates.length} Certificate{certificates.length !== 1 ? "s" : ""} Uploaded
                  </p>
                </div>

                {/* Contact Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{profile?.email || "email@doctor.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{profile?.phone || "+XXX XXX XXX XXX"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Appointments & Schedule
                  </motion.button>

                  {!editMode && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditMode(true)}
                      className="w-full py-3 px-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit className="w-4 h-4 inline mr-2" />
                      Update Profile
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h3 className="text-2xl font-bold">Profile Details</h3>
                <p className="text-blue-100 mt-1">Manage your professional information</p>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-slate-700">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                          activeTab === tab.id
                            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {/* Personal Info Tab */}
                    {activeTab === "personal" && (
                      <motion.div
                        key="personal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <User className="w-4 h-4 inline mr-2" />
                              Full Name
                            </label>
                            <Controller
                              name="name"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter your full name"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Phone className="w-4 h-4 inline mr-2" />
                              Phone Number
                            </label>
                            <Controller
                              name="phone"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter your phone number"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Address
                          </label>
                          <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="email"
                                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your email"
                                disabled={!editMode}
                              />
                            )}
                          />
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />
                            Bio
                          </label>
                          <Controller
                            name="bio"
                            control={control}
                            render={({ field }) => (
                              <textarea
                                {...field}
                                className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="Tell us about yourself (max 500 characters)"
                                disabled={!editMode}
                                rows={4}
                              />
                            )}
                          />
                          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Professional Tab */}
                    {activeTab === "professional" && (
                      <motion.div
                        key="professional"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <GraduationCap className="w-4 h-4 inline mr-2" />
                              Qualification
                            </label>
                            <Controller
                              name="qualification"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter your qualification"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.qualification && (
                              <p className="text-red-500 text-sm mt-1">{errors.qualification.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Stethoscope className="w-4 h-4 inline mr-2" />
                              Specialization
                            </label>
                            <Controller
                              name="specialization"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter your specialization"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.specialization && (
                              <p className="text-red-500 text-sm mt-1">{errors.specialization.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Shield className="w-4 h-4 inline mr-2" />
                              Medical Registration Number
                            </label>
                            <Controller
                              name="registrationNumber"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter your registration number"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.registrationNumber && (
                              <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <Clock className="w-4 h-4 inline mr-2" />
                              Experience (Years)
                            </label>
                            <Controller
                              name="experience"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter years of experience"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.experience && (
                              <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === "financial" && (
                      <motion.div
                        key="financial"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pricing Guidelines</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Set competitive consultation fees based on your experience and specialization. Extra charges
                            can be applied for special procedures or extended consultations.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <IndianRupee className="w-4 h-4 inline mr-2" />
                              Consultation Fee (₹)
                            </label>
                            <Controller
                              name="ticketPrice"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter consultation fee"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.ticketPrice && (
                              <p className="text-red-500 text-sm mt-1">{errors.ticketPrice.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <IndianRupee className="w-4 h-4 inline mr-2" />
                              Extra Charge (₹)
                            </label>
                            <Controller
                              name="extraCharge"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="number"
                                  className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="Enter extra fee (if any)"
                                  disabled={!editMode}
                                />
                              )}
                            />
                            {errors.extraCharge && (
                              <p className="text-red-500 text-sm mt-1">{errors.extraCharge.message}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === "documents" && (
                      <motion.div
                        key="documents"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Upload Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Upload Medical Certificates
                          </h4>

                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <label
                                htmlFor="certificate-upload"
                                className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                              >
                                <File className="w-5 h-5 text-blue-500" />
                                <span className="text-blue-600 dark:text-blue-400">
                                  {selectedCertificate ? selectedCertificate.name : "Choose certificate file"}
                                </span>
                              </label>
                              <input
                                id="certificate-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleCertificateChange}
                                className="hidden"
                              />
                            </div>

                            {selectedCertificate && (
                              <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCertificateUpload}
                                disabled={certificateUploading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                              >
                                {certificateUploading ? (
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Upload size={18} />
                                )}
                                {certificateUploading ? "Uploading..." : "Upload Certificate"}
                              </motion.button>
                            )}

                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className="mb-2">Supported formats: PDF, JPEG, PNG (Max 5MB)</p>
                              <p>Upload your medical degree, license, and other relevant certificates.</p>
                            </div>
                          </div>
                        </div>

                        {/* Certificates List */}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Uploaded Certificates ({certificates.length})
                          </h4>

                          {certificates.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <File size={48} className="mx-auto mb-4 opacity-50" />
                              <p>No certificates uploaded yet</p>
                              <p className="text-sm">Upload your medical certificates to verify your profile</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {certificates.map((certificate) => (
                                <motion.div
                                  key={certificate._id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                      <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{certificate.name}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Uploaded on {new Date(certificate.uploadedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleDownloadCertificate(certificate.url, certificate.name)}
                                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      title="Download"
                                    >
                                      <Download size={16} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleDeleteCertificate(certificate._id)}
                                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </motion.button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  {editMode && activeTab !== "documents" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-slate-700"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!isDirty}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={18} />
                        Save Changes
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          setEditMode(false)
                          reset()
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                      >
                        <X size={18} />
                        Cancel
                      </motion.button>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {otpSent && (
          <OtpModal
            doctorId={doctor?._id || ""}
            newEmail={newEmail}
            onVerify={handleVerifySuccess}
            onClose={() => setOtpSent(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile



// import React, { ChangeEvent, useEffect, useState } from "react";
// import { Camera, CheckCircle, Edit } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import { setError, setLoading } from "../../slice/user/userSlice";
// import doctorApi from "../../axios/DoctorInstance";
// import {
//   setProfile,
//   updateProfilePicture,
// } from "../../slice/Doctor/doctorSlice";
// import { useForm, Controller } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useNavigate } from "react-router-dom";
// import OtpModal from "../CommonComponents/OtpEmailModal";
// import toast from "react-hot-toast";
// import { IProfilePictureResponse } from "../../types/auth";

// // Validation Schema
// const profileSchema = yup.object().shape({
//   name: yup
//     .string()
//     .required("Name is required")
//     .min(3, "Name must be at least 3 characters")
//     .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed"),
//   email: yup
//     .string()
//     .email("Invalid email format")
//     .required("Email is required"),
//   phone: yup
//     .string()
//     .matches(/^\d{10}$/, "Phone number must be 10 digits")
//     .required("Phone number is required"),
//   qualification: yup.string().required("Qualification is required"),
//   specialization: yup.string().required("Specialization is required"),
//   ticketPrice: yup
//     .number()
//     .typeError("Consultation fee must be a number")
//     .required("Consultation fee is required")
//     .min(0, "Consultation fee cannot be negative"),
//     extraCharge: yup
//     .number()
//     .typeError("Extra fee must be a number")
//     .min(0, "Extra fee cannot be negative"),
//   bio: yup.string().max(500, "Bio cannot exceed 500 characters"),
//   experience: yup
//     .number()
//     .typeError("Experience must be a number")
//     .required("Experience is required")
//     .min(0, "Experience cannot be negative"),
// });

// type FormData = yup.InferType<typeof profileSchema>;

// const Profile: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { doctor, profile, loading, error } = useSelector(
//     (state: RootState) => state.doctor
//   );

//   const [editMode, setEditMode] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [newEmail, setNewEmail] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [updateTrigger, setUpdateTrigger] = useState(false);

//   // React Hook Form
//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: yupResolver(profileSchema),
//     defaultValues: {
//       name: profile?.name || "",
//       email: profile?.email || "",
//       phone: profile?.phone || "",
//       qualification: profile?.qualification || "",
//       specialization: profile?.specialization || "",
//       // ticketPrice: profile?.ticketPrice|| ''
//     },
//   });

//   // Fetch profile data
//   useEffect(() => {
//     if (!doctor) {
//       dispatch(setError("Doctor not logged in"));
//       return;
//     }

//     const fetchProfile = async () => {
//       try {
//         dispatch(setLoading());
//         const response = await doctorApi.get(`/profile/${doctor._id}`);

//         if (!response.data.data._id) {
//           throw new Error("Invalid profile data: _id is missing");
//         }

//         dispatch(setProfile(response.data.data));
//         reset(response.data.data);
//       } catch (err) {
//         dispatch(setError("Failed to fetch doctor profile."));
//         console.error(err);
//       }
//     };

//     fetchProfile();
//   }, [dispatch, doctor, reset, updateTrigger]);

//   const handleSave = async (data: FormData) => {
//     try {
//       if (data.email !== profile?.email) {
//         setNewEmail(data.email);
//         await doctorApi.post(`/send-otp`, {
//           doctorId: doctor?._id,
//           newEmail: data.email,
//         });
//         setOtpSent(true);
//         return;
//       }

//       const response = await doctorApi.put(
//         `/updateProfile/${doctor?._id}`,
//         data
//       );

//       dispatch(setProfile(response.data.updatedProfile));
//       reset(response.data.updatedProfile);
//       setEditMode(false);
//       setUpdateTrigger((prev) => !prev);
//     } catch (err) {
//       console.error("Profile update failed:", err);
//       dispatch(setError("Profile update failed."));
//     }
//   };

//   const handleVerifySuccess = () => {
//     if (profile?._id) {
//       dispatch(setProfile({ ...profile, email: newEmail }));
//     }
//     setOtpSent(false);
//     setEditMode(false);
//     navigate("/doctor/profile");
//   };

//   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0] || null;
//     setSelectedFile(file);
//     if (file) {
//       const previewURL = URL.createObjectURL(file);
//       setPreview(previewURL);
//     }
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       toast.error("Please select a file to upload.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("profilePicture", selectedFile);

//     try {
//       const response = await doctorApi.post<IProfilePictureResponse>(
//         "/uploadProfilePicture",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log('hi',response);

//       const uploadedImageUrl : any = response.data.data?.profilePicture;
//       toast.success("Profile picture uploaded successfully");
//       dispatch(updateProfilePicture(uploadedImageUrl));
//       setSelectedFile(null);
//       setPreview(null);
//     } catch (error: unknown) {
//       console.error("Error uploading profile picture:", error);
//       toast.error("Failed to upload profile picture.");
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
//         <div className="w-12 h-12 border-4 border-[#6b4f4f] border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
//         <p className="text-[#5a3e36] font-serif text-lg">Error: {error}</p>
//       </div>
//     );

//   return (
//     <div className="flex flex-col md:flex-row bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
//       {/* Left Side - Doctor Info */}
//       <div className="bg-white p-8 rounded-2xl shadow-lg w-full md:w-1/3 flex flex-col items-center relative">
//         {/* Doctor Profile Picture */}
//         <div className="relative w-36 h-36 flex items-center justify-center">
//           {profile?.profilePicture || preview ? (
//             <img
//               src={preview || profile?.profilePicture || ""}
//               alt="Doctor Profile"
//               className="w-36 h-36 rounded-full border-4 border-gray-300 object-cover shadow-md"
//             />
//           ) : (
//             <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-md">
//               <span className="text-gray-600 text-lg font-semibold">
//                 No Image
//               </span>
//             </div>
//           )}

//           {/* Camera Icon for Changing Picture */}
//           <label
//             htmlFor="file-upload"
//             className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-green-600 transition duration-200"
//           >
//             <Camera size={18} />
//           </label>
//           <input
//             id="file-upload"
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             className="hidden"
//           />
//         </div>

//         {/* Upload Button */}
//         {selectedFile && (
//           <button
//             onClick={handleUpload}
//             className="mt-4 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-sm uppercase tracking-wide shadow-md"
//           >
//             Upload Picture
//           </button>
//         )}

//         {/* Doctor Details */}
//         <h2 className="mt-4 text-xl font-semibold">
//           {profile?.name || "Dr. Name"}
//         </h2>
//         <p className="text-gray-500">{profile?.email || "email@doctor.com"}</p>
//         <p className="text-gray-500">{profile?.phone || "+XXX XXX XXX XXX"}</p>

//         {/* Buttons */}
//         <div className="mt-4 space-y-3 w-full">
//           <button className="flex items-center justify-center w-full py-2 px-4 bg-green-100 text-green-600 font-medium rounded-md">
//             Appointments & Schedule
//           </button>
//           {!editMode && (
//             <button
//               className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 text-gray-600 font-medium rounded-md"
//               onClick={() => setEditMode(true)}
//             >
//               <Edit size={16} /> Update Profile
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Right Side - Profile Form */}
//       <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-2/3 ml-0 md:ml-6 mt-6 md:mt-0">
//         <h3 className="text-xl font-semibold mb-4">Profile Details</h3>

//         {/* Form Inputs */}
//         <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
//           <div>
//             <label className="text-gray-600">Full Name</label>
//             <Controller
//               name="name"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="text"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter your full name"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.name && (
//               <p className="text-red-500 text-sm">{errors.name.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Phone Number</label>
//             <Controller
//               name="phone"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="text"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter your phone number"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.phone && (
//               <p className="text-red-500 text-sm">{errors.phone.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Email</label>
//             <Controller
//               name="email"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="email"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter your email"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.email && (
//               <p className="text-red-500 text-sm">{errors.email.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Qualification</label>
//             <Controller
//               name="qualification"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="text"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter your qualification"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.qualification && (
//               <p className="text-red-500 text-sm">
//                 {errors.qualification.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Specialization</label>
//             <Controller
//               name="specialization"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="text"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter your specialization"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.specialization && (
//               <p className="text-red-500 text-sm">
//                 {errors.specialization.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Experience</label>
//             <Controller
//               name="experience"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="number"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter experience"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.experience && (
//               <p className="text-red-500 text-sm">{errors.experience.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Consultation Fee</label>
//             <Controller
//               name="ticketPrice"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="number"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter consultation fee"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.ticketPrice&& (
//               <p className="text-red-500 text-sm">
//                 {errors.ticketPrice.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Extra Charge</label>
//             <Controller
//               name="extraCharge"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="number"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter extra fee (if any)"
//                   disabled={!editMode}
//                 />
//               )}
//             />
//             {errors.extraCharge && (
//               <p className="text-red-500 text-sm">{errors.extraCharge.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-600">Bio</label>
//             <Controller
//               name="bio"
//               control={control}
//               render={({ field }) => (
//                 <textarea
//                   {...field}
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Enter your bio (max 500 characters)"
//                   disabled={!editMode}
//                   rows={4}
//                 />
//               )}
//             />
//             {errors.bio && (
//               <p className="text-red-500 text-sm">{errors.bio.message}</p>
//             )}
//           </div>

//           {/* Action Buttons (Show Only in Edit Mode) */}
//           {editMode && (
//             <div className="mt-6 flex justify-between">
//               <button
//                 type="submit"
//                 className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md"
//               >
//                 <CheckCircle size={16} /> Save Changes
//               </button>
//               <button
//                 type="button"
//                 className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md"
//                 onClick={() => setEditMode(false)}
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </form>
//       </div>

//       {/* OTP Modal */}
//       {otpSent && (
//         <OtpModal
//           doctorId={doctor?._id || ""}
//           newEmail={newEmail}
//           onVerify={handleVerifySuccess}
//           onClose={() => setOtpSent(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Profile;
