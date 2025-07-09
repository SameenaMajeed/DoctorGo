"use client"

import type React from "react"
import { useEffect, useState } from "react"
import TextInput from "../CommonComponents/TextInput"
import TextArea from "../CommonComponents/TextArea"
import SelectInput from "../CommonComponents/SelectInput"
import * as yup from "yup"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../slice/Store/Store"
import { setError} from "../../slice/user/userSlice"
import toast from "react-hot-toast"
import { fetchUserProfile, updateProfilePicture, updateUserProfile } from "../../Api/UserApis"
import NewPasswordModal from "../CommonComponents/NewPasswordModel"
import { User, Camera, Edit3, Save, X, Lock, Mail, Loader, Upload, Check } from 'lucide-react'

// Validation Schema
const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(3)
    .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  mobile_no: yup.string().matches(/^\d{10}$/, "Phone number must be 10 digits").required("Phone number is required"),
  address: yup.string().required("Address is required").max(500),
  gender: yup.string().required("Gender is required"),
  DOB: yup.string().required("Date of Birth is required"),
  age: yup.string().required("Age is required"),
})

type FormData = yup.InferType<typeof profileSchema>

const UserProfile: React.FC = () => {
  const dispatch = useDispatch()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { user, loading, error } = useSelector((state: RootState) => state.user)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile_no: "",
      address: "",
      gender: "",
      DOB: "",
      age: "",
    },
  })

  useEffect(() => {
    if (!user) {
      dispatch(setError("User not logged in"))
      return
    }
    const loadProfile = async () => {
      const { success } = await fetchUserProfile(dispatch, reset)
      if (!success) {
        toast.error("Failed to load profile")
      }
    }
    loadProfile()
  }, [dispatch, updateTrigger])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const { success, message } = await updateUserProfile(data, dispatch)
    if (success) {
      setIsEditing(false)
      toast.success(message)
      setUpdateTrigger((prev) => !prev)
    } else {
      toast.error(message)
    }
    setIsSubmitting(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
      setSelectedFile(file)
    }
  }

  const handleUpdateProfilePicture = async () => {
    if (!selectedFile) return
    const { success, message} = await updateProfilePicture(selectedFile, dispatch)
    if (success) {
      toast.success(message)
      setUpdateTrigger((prev) => !prev)
      setImagePreview(null)
      setSelectedFile(null)
    } else {
      toast.error(message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/60">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Loader className="animate-spin text-blue-600" size={32} />
              </div>
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-800 mb-1">Loading Profile</h3>
              <p className="text-slate-500">Please wait while we fetch your profile data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-red-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Profile Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="text-white" size={24} />
            </div>
            My Profile
          </h1>
          <p className="text-slate-600">Manage your personal information and account settings</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Left Panel - Profile Picture & Actions */}
              <div className="lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-blue-50/30">
                <div className="text-center">
                  {/* Profile Picture */}
                  <div className="relative inline-block mb-6">
                    <div className="w-40 h-40 mx-auto relative group">
                      <img
                        src={
                          imagePreview ||
                          user?.profilePicture ||
                          "/placeholder.svg?height=160&width=160"
                         || "/placeholder.svg"}
                        alt="Profile"
                        className="rounded-full object-cover w-full h-full border-4 border-white shadow-xl transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white" size={24} />
                      </div>
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  {/* User Info */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{user?.name || "User Name"}</h2>
                    <p className="text-slate-500 flex items-center justify-center gap-1">
                      <Mail size={14} />
                      {user?.email || "user@example.com"}
                    </p>
                  </div>

                  {/* Upload Section */}
                  <div className="mb-6">
                    <input
                      type="file"
                      id="upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload"
                      className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md font-medium"
                    >
                      <Upload size={18} />
                      Upload New Photo
                    </label>
                  </div>

                  {/* Update Picture Button */}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleUpdateProfilePicture}
                      className="w-full mb-4 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 font-medium"
                    >
                      <Check size={18} />
                      Update Profile Picture
                    </button>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 ${
                        isEditing
                          ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105"
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <X size={18} />
                          Cancel Editing
                        </>
                      ) : (
                        <>
                          <Edit3 size={18} />
                          Edit Profile
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <Lock size={18} />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Form Fields */}
              <div className="lg:w-2/3 p-8">
                {/* Contact Information Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <Mail className="text-blue-600" size={16} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          id="email"
                          label="Email Address"
                          type="email"
                          {...field}
                          error={errors.email?.message}
                          readOnly={true}
                        />
                      )}
                    />
                    <Controller
                      name="mobile_no"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          id="mobile_no"
                          label="Phone Number"
                          {...field}
                          error={errors.mobile_no?.message}
                          readOnly={!isEditing}
                        />
                      )}
                    />
                    <div className="md:col-span-2">
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <TextArea
                            id="address"
                            label="Address"
                            {...field}
                            error={errors.address?.message}
                            readOnly={!isEditing}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="text-green-600" size={16} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          id="name"
                          label="Full Name"
                          {...field}
                          error={errors.name?.message}
                          readOnly={!isEditing}
                        />
                      )}
                    />
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <SelectInput
                          id="gender"
                          label="Gender"
                          {...field}
                          options={["Male", "Female", "Other"]}
                          error={errors.gender?.message}
                          readOnly={!isEditing}
                        />
                      )}
                    />
                    <Controller
                      name="DOB"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          id="DOB"
                          label="Date of Birth"
                          type="date"
                          {...field}
                          error={errors.DOB?.message}
                          readOnly={!isEditing}
                        />
                      )}
                    />
                    <Controller
                      name="age"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          id="age"
                          label="Age"
                          {...field}
                          error={errors.age?.message}
                          readOnly={!isEditing}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-6 border-t border-slate-200/60">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Password Modal */}
        <NewPasswordModal
          show={showPasswordModal}
          email={user?.email || ""}
          role={user?.role || "user"}
          onClose={() => setShowPasswordModal(false)}
        />
      </div>
    </div>
  )
}

export default UserProfile




// import React, { useEffect, useState } from "react";
// import TextInput from "../CommonComponents/TextInput";
// import TextArea from "../CommonComponents/TextArea";
// import SelectInput from "../CommonComponents/SelectInput";
// import * as yup from "yup";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import { setError, setLoading, setUser } from "../../slice/user/userSlice";
// import toast from "react-hot-toast";
// import {
//   fetchUserProfile,
//   updateProfilePicture,
//   updateUserProfile,
// } from "../../Api/UserApis";
// import NewPasswordModal from "../CommonComponents/NewPasswordModel";

// // Validation Schema
// const profileSchema = yup.object().shape({
//   name: yup
//     .string()
//     .required("Name is required")
//     .min(3)
//     .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed"),
//   email: yup
//     .string()
//     .email("Invalid email format")
//     .required("Email is required"),
//   mobile_no: yup
//     .string()
//     .matches(/^\d{10}$/, "Phone number must be 10 digits")
//     .required("Phone number is required"),
//   address: yup.string().required("Address is required").max(500),
//   gender: yup.string().required("Gender is required"),
//   DOB: yup.string().required("Date of Birth is required"),
//   age: yup.string().required("Age is required"),
// });

// type FormData = yup.InferType<typeof profileSchema>;

// const UserProfile: React.FC = () => {
//   const dispatch = useDispatch();
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const { user, loading, error } = useSelector(
//     (state: RootState) => state.user
//   );

//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [updateTrigger, setUpdateTrigger] = useState(false);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: yupResolver(profileSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       mobile_no: "",
//       address: "",
//       gender: "",
//       DOB: "",
//       age: "",
//     },
//   });

//   useEffect(() => {
//     if (!user) {
//       dispatch(setError("User not logged in"));
//       return;
//     }

//     const loadProfile = async () => {
//       const { success } = await fetchUserProfile(dispatch, reset);

//       if (!success) {
//         toast.error("Failed to load profile");
//       }
//     };

//     loadProfile();
//   }, [dispatch, updateTrigger]);

//   const onSubmit = async (data: FormData) => {
//     setIsSubmitting(true);

//     const { success, message, updatedUser } = await updateUserProfile(
//       data,
//       dispatch
//     );

//     if (success) {
//       setIsEditing(false);
//       toast.success(message);
//       setUpdateTrigger((prev) => !prev);
//     } else {
//       toast.error(message);
//     }

//     setIsSubmitting(false);
//   };

//   // const onSubmit = async (data: FormData) => {
//   //   try {
//   //     dispatch(setLoading());

//   //     const updateData = {
//   //       name: data.name,
//   //       email: data.email,
//   //       mobile_no: data.mobile_no,
//   //       address: data.address,
//   //       DOB: data.DOB,
//   //       gender: data.gender,
//   //       age: data.age,
//   //     };

//   //     console.log("updateData:", updateData);
//   //     const response = await api.put("/updateProfile", updateData);
//   //     dispatch(setUser(response.data.data));
//   //     setIsEditing(false);
//   //     toast.success("Profile updated successfully");
//   //     setUpdateTrigger((prev) => !prev);
//   //   } catch (error: unknown) {
//   //     const axiosError = error as AxiosError;
//   //     const errorMessage =
//   //       axiosError.response?.data?.message || "Failed to update profile";
//   //     toast.error(errorMessage);
//   //     console.error("Update error:", error);
//   //   }
//   // };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//       setSelectedFile(file);
//     }
//   };

//   const handleUpdateProfilePicture = async () => {
//     if (!selectedFile) return;

//     const { success, message, data } = await updateProfilePicture(
//       selectedFile,
//       dispatch
//     );

//     if (success) {
//       toast.success(message);
//       setUpdateTrigger((prev) => !prev);
//       setImagePreview(null);
//       setSelectedFile(null);
//     } else {
//       toast.error(message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
//         <div className="w-12 h-12 border-4 border-[#6b4f4f] border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
//         <p className="text-[#5a3e36] font-serif text-lg">Error: {error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
//       <main className="flex-1 p-4 sm:p-6 md:p-10 bg-gray-50">
//       <h2 className="text-3xl font-extrabold text-blue-400 mb-6 text-center">
//       MY PROFILE
//       </h2>
        

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
//             {/* Left Panel */}
//             <section className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r text-center bg-white">
//               <div className="w-32 h-32 mx-auto mb-4 relative group">
//                 <img
//                   src={
//                     imagePreview ||
//                     user?.profilePicture ||
//                     "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
//                   }
//                   alt="Profile"
//                   className="rounded-full object-cover w-full h-full border-4 border-blue-200 shadow-md transition-transform group-hover:scale-105"
//                 />
//               </div>

//               {/* Upload */}
//               <div className="mt-6">
//                 <input
//                   type="file"
//                   id="upload"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="hidden"
//                 />
//                 <label
//                   htmlFor="upload"
//                   className="inline-block cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md transition text-sm font-medium"
//                 >
//                   📸 Upload Image
//                 </label>
//               </div>

//               {imagePreview && (
//                 <button
//                   type="button"
//                   onClick={handleUpdateProfilePicture}
//                   className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
//                 >
//                   ✅ Update Profile Picture
//                 </button>
//               )}

//               <div className="mt-4 space-y-3 w-full">
//                 <button
//                   type="button"
//                   onClick={() => setIsEditing(!isEditing)}
//                   className={`flex items-center justify-center gap-2 w-full py-2 px-4 ${
//                     isEditing
//                       ? "bg-gray-200 text-gray-600"
//                       : "bg-green-200 text-green-700"
//                   } font-medium rounded-md shadow-sm hover:shadow-md transition duration-200`}
//                 >
//                   {isEditing ? "❌ Cancel" : "✏️ Edit Profile"}
//                 </button>
//                 <button
//                   type="button"
//                   className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 text-gray-600 font-medium rounded-md hover:bg-gray-200 transition"
//                   onClick={() => setShowPasswordModal(true)}
//                 >
//                   🔐 Change Password
//                 </button>
//                 <NewPasswordModal
//                   show={showPasswordModal}
//                   email={user?.email || ""} // Use the email from your user state
//                   role={user?.role || "user"} // Use the role from your user state or default to 'user'
//                   onClose={() => setShowPasswordModal(false)}
//                 />
//               </div>
//             </section>

//             {/* Right Panel */}
//             <section className="md:w-2/3 p-6 bg-white">
//               <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
//                 Contact Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <Controller
//                   name="email"
//                   control={control}
//                   render={({ field }) => (
//                     <TextInput
//                       id="email"
//                       label="Email"
//                       type="email"
//                       {...field}
//                       error={errors.email?.message}
//                       readOnly={true}
//                     />
//                   )}
//                 />
//                 <Controller
//                   name="mobile_no"
//                   control={control}
//                   render={({ field }) => (
//                     <TextInput
//                       id="mobile_no"
//                       label="Phone"
//                       {...field}
//                       error={errors.mobile_no?.message}
//                       readOnly={!isEditing}
//                     />
//                   )}
//                 />
//                 <div className="md:col-span-2">
//                   <Controller
//                     name="address"
//                     control={control}
//                     render={({ field }) => (
//                       <TextArea
//                         id="address"
//                         label="Address"
//                         {...field}
//                         error={errors.address?.message}
//                         readOnly={!isEditing}
//                       />
//                     )}
//                   />
//                 </div>
//               </div>

//               <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
//                 Basic Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <Controller
//                   name="name"
//                   control={control}
//                   render={({ field }) => (
//                     <TextInput
//                       id="name"
//                       label="Full Name"
//                       {...field}
//                       error={errors.name?.message}
//                       readOnly={!isEditing}
//                     />
//                   )}
//                 />
//                 <Controller
//                   name="gender"
//                   control={control}
//                   render={({ field }) => (
//                     <SelectInput
//                       id="gender"
//                       label="Gender"
//                       {...field}
//                       options={["Male", "Female", "Other"]}
//                       error={errors.gender?.message}
//                       readOnly={!isEditing}
//                     />
//                   )}
//                 />
//                 <Controller
//                   name="DOB"
//                   control={control}
//                   render={({ field }) => (
//                     <TextInput
//                       id="DOB"
//                       label="Date of Birth"
//                       type="date"
//                       {...field}
//                       error={errors.DOB?.message}
//                       readOnly={!isEditing}
//                     />
//                   )}
//                 />
//                 <Controller
//                   name="age"
//                   control={control}
//                   render={({ field }) => (
//                     <TextInput
//                       id="age"
//                       label="Age"
//                       {...field}
//                       error={errors.age?.message}
//                       readOnly={!isEditing}
//                     />
//                   )}
//                 />
//               </div>

//               {/* Save Button */}
//               {isEditing && (
//                 <div className="flex justify-end mt-8">
//                   <button
//                     type="submit"
//                     className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 shadow transition"
//                   >
//                     ✅ <span>Save Changes</span>
//                   </button>
//                 </div>
//               )}
//             </section>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// };

// export default UserProfile;
