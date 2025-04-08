import React, { ChangeEvent, useEffect, useState } from "react";
import { Camera, CheckCircle, Edit } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { setError, setLoading } from "../../slice/user/userSlice";
import doctorApi from "../../axios/DoctorInstance";
import {
  setProfile,
  updateProfilePicture,
} from "../../slice/Doctor/doctorSlice";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import OtpModal from "../CommonComponents/OtpEmailModal";
import toast from "react-hot-toast";
import { ProfilePictureResponse } from "../../types/auth";

// Validation Schema
const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  qualification: yup.string().required("Qualification is required"),
  specialization: yup.string().required("Specialization is required"),
  ticketPrice: yup
    .number()
    .typeError("Consultation fee must be a number")
    .required("Consultation fee is required")
    .min(0, "Consultation fee cannot be negative"),
    extraCharge: yup
    .number()
    .typeError("Extra fee must be a number")
    .min(0, "Extra fee cannot be negative"),
  bio: yup.string().max(500, "Bio cannot exceed 500 characters"),
  experience: yup
    .number()
    .typeError("Experience must be a number")
    .required("Experience is required")
    .min(0, "Experience cannot be negative"),
});

type FormData = yup.InferType<typeof profileSchema>;

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { doctor, profile, loading, error } = useSelector(
    (state: RootState) => state.doctor
  );

  const [editMode, setEditMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      qualification: profile?.qualification || "",
      specialization: profile?.specialization || "",
      // ticketPrice: profile?.ticketPrice|| ''
    },
  });

  // Fetch profile data
  useEffect(() => {
    if (!doctor) {
      dispatch(setError("Doctor not logged in"));
      return;
    }

    const fetchProfile = async () => {
      try {
        dispatch(setLoading());
        const response = await doctorApi.get(`/profile/${doctor._id}`);

        if (!response.data.data._id) {
          throw new Error("Invalid profile data: _id is missing");
        }

        dispatch(setProfile(response.data.data));
        reset(response.data.data);
      } catch (err) {
        dispatch(setError("Failed to fetch doctor profile."));
        console.error(err);
      }
    };

    fetchProfile();
  }, [dispatch, doctor, reset, updateTrigger]);

  const handleSave = async (data: FormData) => {
    try {
      if (data.email !== profile?.email) {
        setNewEmail(data.email);
        await doctorApi.post(`/send-otp`, {
          doctorId: doctor?._id,
          newEmail: data.email,
        });
        setOtpSent(true);
        return;
      }

      const response = await doctorApi.put(
        `/updateProfile/${doctor?._id}`,
        data
      );

      dispatch(setProfile(response.data.updatedProfile));
      reset(response.data.updatedProfile);
      setEditMode(false);
      setUpdateTrigger((prev) => !prev);
    } catch (err) {
      console.error("Profile update failed:", err);
      dispatch(setError("Profile update failed."));
    }
  };

  const handleVerifySuccess = () => {
    if (profile?._id) {
      dispatch(setProfile({ ...profile, email: newEmail }));
    }
    setOtpSent(false);
    setEditMode(false);
    navigate("/doctor/profile");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
    console.log("hi", selectedFile);
    console.log("hi", formData);

    try {
      const response = await doctorApi.post<ProfilePictureResponse>(
        "/uploadProfilePicture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response);

      const uploadedImageUrl = response.data.data.profilePicture;
      toast.success("Profile picture uploaded successfully");
      dispatch(updateProfilePicture(uploadedImageUrl));
      setSelectedFile(null);
      setPreview(null);
    } catch (error: unknown) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
        <div className="w-12 h-12 border-4 border-[#6b4f4f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
        <p className="text-[#5a3e36] font-serif text-lg">Error: {error}</p>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
      {/* Left Side - Doctor Info */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full md:w-1/3 flex flex-col items-center relative">
        {/* Doctor Profile Picture */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {profile?.profilePicture || preview ? (
            <img
              src={preview || profile?.profilePicture || ""}
              alt="Doctor Profile"
              className="w-36 h-36 rounded-full border-4 border-gray-300 object-cover shadow-md"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-md">
              <span className="text-gray-600 text-lg font-semibold">
                No Image
              </span>
            </div>
          )}

          {/* Camera Icon for Changing Picture */}
          <label
            htmlFor="file-upload"
            className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-green-600 transition duration-200"
          >
            <Camera size={18} />
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Upload Button */}
        {selectedFile && (
          <button
            onClick={handleUpload}
            className="mt-4 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-sm uppercase tracking-wide shadow-md"
          >
            Upload Picture
          </button>
        )}

        {/* Doctor Details */}
        <h2 className="mt-4 text-xl font-semibold">
          {profile?.name || "Dr. Name"}
        </h2>
        <p className="text-gray-500">{profile?.email || "email@doctor.com"}</p>
        <p className="text-gray-500">{profile?.phone || "+XXX XXX XXX XXX"}</p>

        {/* Buttons */}
        <div className="mt-4 space-y-3 w-full">
          <button className="flex items-center justify-center w-full py-2 px-4 bg-green-100 text-green-600 font-medium rounded-md">
            Appointments & Schedule
          </button>
          {!editMode && (
            <button
              className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 text-gray-600 font-medium rounded-md"
              onClick={() => setEditMode(true)}
            >
              <Edit size={16} /> Update Profile
            </button>
          )}
        </div>
      </div>

      {/* Right Side - Profile Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-2/3 ml-0 md:ml-6 mt-6 md:mt-0">
        <h3 className="text-xl font-semibold mb-4">Profile Details</h3>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div>
            <label className="text-gray-600">Full Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your full name"
                  disabled={!editMode}
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Phone Number</label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your phone number"
                  disabled={!editMode}
                />
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your email"
                  disabled={!editMode}
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Qualification</label>
            <Controller
              name="qualification"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your qualification"
                  disabled={!editMode}
                />
              )}
            />
            {errors.qualification && (
              <p className="text-red-500 text-sm">
                {errors.qualification.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Specialization</label>
            <Controller
              name="specialization"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your specialization"
                  disabled={!editMode}
                />
              )}
            />
            {errors.specialization && (
              <p className="text-red-500 text-sm">
                {errors.specialization.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Experience</label>
            <Controller
              name="experience"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter experience"
                  disabled={!editMode}
                />
              )}
            />
            {errors.experience && (
              <p className="text-red-500 text-sm">{errors.experience.message}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Consultation Fee</label>
            <Controller
              name="ticketPrice"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter consultation fee"
                  disabled={!editMode}
                />
              )}
            />
            {errors.ticketPrice&& (
              <p className="text-red-500 text-sm">
                {errors.ticketPrice.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Extra Charge</label>
            <Controller
              name="extraCharge"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter extra fee (if any)"
                  disabled={!editMode}
                />
              )}
            />
            {errors.extraCharge && (
              <p className="text-red-500 text-sm">{errors.extraCharge.message}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600">Bio</label>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your bio (max 500 characters)"
                  disabled={!editMode}
                  rows={4}
                />
              )}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>

          {/* Action Buttons (Show Only in Edit Mode) */}
          {editMode && (
            <div className="mt-6 flex justify-between">
              <button
                type="submit"
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md"
              >
                <CheckCircle size={16} /> Save Changes
              </button>
              <button
                type="button"
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* OTP Modal */}
      {otpSent && (
        <OtpModal
          doctorId={doctor?._id || ""}
          newEmail={newEmail}
          onVerify={handleVerifySuccess}
          onClose={() => setOtpSent(false)}
        />
      )}
    </div>
  );
};

export default Profile;
