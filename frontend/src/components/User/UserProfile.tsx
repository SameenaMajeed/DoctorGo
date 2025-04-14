import React, { useEffect, useState } from "react";
import Navbar from "./Home/Navbar";
import Sidebar from "./SideBar";
import TextInput from "../CommonComponents/TextInput";
import TextArea from "../CommonComponents/TextArea";
import SelectInput from "../CommonComponents/SelectInput";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import {
  setError,
  setLoading,
  setUser,
} from "../../slice/user/userSlice";
import api from "../../axios/UserInstance";
import toast from "react-hot-toast";
import { AxiosError, ProfileResponse } from "../../types/auth";

// Validation Schema
const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(3)
    .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  mobile_no: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  address: yup.string().required("Address is required").max(500),
  gender: yup.string().required("Gender is required"),
  DOB: yup.string().required("Date of Birth is required"),
  age: yup.string().required("Age is required"),
});

type FormData = yup.InferType<typeof profileSchema>;

const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
  });

  // Format date for input[type="date"]
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Fetch profile data
  useEffect(() => {
    if (!user) {
      dispatch(setError("User not logged in"));
      return;
    }

    const fetchProfile = async () => {
      try {
        dispatch(setLoading());
        const response = await api.get<ProfileResponse>(`/profile`);
        const profileData = response.data.data;
        console.log("profileData :", profileData);

        // Format data for form
        const formattedData = {
          ...profileData,
          DOB: formatDateForInput(profileData.DOB),
          profilePicture: profileData.profilePicture ?? undefined,
        };

        dispatch(setUser(formattedData));
        reset(formattedData);
      } catch (err) {
        dispatch(setError("Failed to fetch user profile."));
        console.error(err);
      }
    };

    fetchProfile();
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    try {
      dispatch(setLoading());

      const updateData = {
        name: data.name,
        email: data.email,
        mobile_no: data.mobile_no,
        address: data.address,
        DOB: data.DOB,
        gender: data.gender,
        age: data.age,
      };

      console.log("updateData:", updateData);
      const response = await api.put("/updateProfile", updateData);
      dispatch(setUser(response.data.data));
      setIsEditing(false);
      toast.success("Profile updated successfully");
      setUpdateTrigger((prev) => !prev);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      console.error("Update error:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleUpdateProfilePicture = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      const response = await api.put("/uploadProfilePicture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile picture updated successfully");
      setUpdateTrigger((prev) => !prev);
      setImagePreview(null);
      setSelectedFile(null);
    } catch (error) {
      toast.error("Failed to update profile picture");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
        <div className="w-12 h-12 border-4 border-[#6b4f4f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
        <p className="text-[#5a3e36] font-serif text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navbar />
      </div>

      <div className="flex flex-1 pt-20">
        <aside className="hidden md:block w-64 bg-white border-r">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-gray-50">
          <h2 className="text-3xl font-extrabold text-blue-400 tracking-tight mb-6 flex items-center gap-2">
           MY PROFILE
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
              {/* Left Panel */}
              <section className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r text-center bg-white">
                <div className="w-32 h-32 mx-auto mb-4 relative group">
                  <img
                    src={
                      imagePreview ||
                      user?.profilePicture ||
                      "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                    }
                    alt="Profile"
                    className="rounded-full object-cover w-full h-full border-4 border-blue-200 shadow-md transition-transform group-hover:scale-105"
                  />
                </div>

                {/* Upload */}
                <div className="mt-6">
                  <input
                    type="file"
                    id="upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="upload"
                    className="inline-block cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md transition text-sm font-medium"
                  >
                    📸 Upload Image
                  </label>
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleUpdateProfilePicture}
                    className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
                  >
                    ✅ Update Profile Picture
                  </button>
                )}

                <div className="mt-4 space-y-3 w-full">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center justify-center gap-2 w-full py-2 px-4 ${
                      isEditing
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-200 text-green-700"
                    } font-medium rounded-md shadow-sm hover:shadow-md transition duration-200`}
                  >
                    {isEditing ? "❌ Cancel" : "✏️ Edit Profile"}
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 text-gray-600 font-medium rounded-md hover:bg-gray-200 transition"
                  >
                    🔐 Change Password
                  </button>
                </div>
              </section>

              {/* Right Panel */}
              <section className="md:w-2/3 p-6 bg-white">
                <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        id="email"
                        label="Email"
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
                        label="Phone"
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

                <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                  Basic Information
                </h3>
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

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end mt-8">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 shadow transition"
                    >
                      ✅ <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </section>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
