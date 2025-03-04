import React, { useEffect, useState } from "react";
import { Camera, CheckCircle, Edit } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { setError, setLoading } from "../../slice/user/userSlice";
import doctorApi from "../../axios/DoctorInstance";
import { setProfile } from "../../slice/Doctor/doctorSlice";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import OtpModal from '../CommonComponents/OtpEmailModal'

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
      <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 flex flex-col items-center">
        {/* Doctor Profile Picture */}
        <div className="relative w-32 h-32">
          <img
            src={profile?.image || "default-doctor-profile.jpg"}
            alt="Doctor Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
          />
          <button className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full">
            <Camera size={16} />
          </button>
        </div>

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

// import React, { useEffect, useState } from "react";
// import { Camera, CheckCircle, Edit } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import { setError, setLoading } from "../../slice/user/userSlice";
// import doctorApi from "../../axios/DoctorInstance";
// import { setProfile } from "../../slice/Doctor/doctorSlice";
// import { useForm, Controller } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useNavigate } from "react-router-dom";

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
// });

// type FormData = yup.InferType<typeof profileSchema>;

// const Profile: React.FC = () => {
  
//   const dispatch = useDispatch();
//   const navigate = useNavigate()

//   const { doctor, profile, loading, error } = useSelector(
//     (state: RootState) => state.doctor
//   );

//   const [editMode, setEditMode] = useState(false);
//   const [otpSent, setOtpSent] = useState(false); // Track OTP step
//   const [otp, setOtp] = useState(""); // Store OTP input
//   const [newEmail, setNewEmail] = useState(""); // Store new email

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
//     },
//   });

//   // Fetch profile data
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
//         reset(response.data.data); // Update form with new data
//       } catch (err) {
//         dispatch(setError("Failed to fetch doctor profile."));
//       }
//     };

//     fetchProfile();
//   }, [dispatch, doctor, reset, updateTrigger]);

//   const handleSave = async (data: FormData) => {
//     try {
//       if (data.email !== profile?.email) {
//         setNewEmail(data.email);
//         await doctorApi.post(`/send-otp`, { doctorId: doctor?._id , newEmail: data.email });
//         setOtpSent(true);
//         return;
//       }

//       const response = await doctorApi.put(
//         `/updateProfile/${doctor?._id}`,
//         data
//       );

//       //Immediately update Redux state
//       dispatch(setProfile(response.data.updatedProfile));

//       // Immediately update React Hook Form state
//       reset(response.data.updatedProfile);

//       setEditMode(false);

//       // ✅ Trigger a re-render
//       setUpdateTrigger((prev) => !prev);
//     } catch (err) {
//       console.error("Profile update failed:", err);
//       dispatch(setError("Profile update failed."));
//     }
//   };

//   const verifyOTP = async () => {
//     try {
//       const response = await doctorApi.post(`/verify-otp`, {
//         doctorId: doctor?._id,
//         otp: otp,
//         newEmail: newEmail, 
//       });
  
//       // ✅ Correct condition to check response message
//       if (response.data.message === "Email updated successfully") {
//         alert("Email updated successfully!");
  
//         // Update the Redux store and profile data
//         if (profile?._id) {
//           dispatch(setProfile({ ...profile, email: newEmail }));
//         } else {
//           throw new Error("Invalid profile data: _id is missing");
//         }
  
//         setOtpSent(false);
//         setEditMode(false);
//         navigate('/doctor/profile');
//       } else {
//         alert("Invalid OTP. Please try again.");
//       }
//     } catch (err) {
//       console.error("OTP verification failed:", err);
//       dispatch(setError("OTP verification failed."));
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
//       <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 flex flex-col items-center">
//         {/* Doctor Profile Picture */}
//         <div className="relative w-32 h-32">
//           <img
//             src={profile?.image || "default-doctor-profile.jpg"}
//             alt="Doctor Profile"
//             className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
//           />
//           <button className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full">
//             <Camera size={16} />
//           </button>
//         </div>

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
//       {otpSent && (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-80">
//             <h3 className="text-lg font-semibold">Enter OTP</h3>
//             <input
//               type="text"
//               className="w-full p-2 border rounded-md mt-3"
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//             />
//             <div className="mt-4 flex justify-between">
//               <button
//                 onClick={verifyOTP}
//                 className="bg-green-500 text-white px-4 py-2 rounded-md"
//               >
//                 Verify & Update
//               </button>
//               <button
//                 onClick={() => setOtpSent(false)}
//                 className="bg-gray-500 text-white px-4 py-2 rounded-md"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;
