import React, { useEffect, useState } from "react";
import { Camera, CheckCircle, Edit } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { setError, setLoading } from "../../slice/user/userSlice";
import doctorApi from "../../axios/DoctorInstance";
import { setProfile } from "../../slice/Doctor/doctorSlice";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { doctor, profile, loading, error } = useSelector(
    (state: RootState) => state.doctor
  );

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    specialization: "",
  });

  useEffect(() => {
    if (!doctor) {
      dispatch(setError("Doctor not logged in"));
      return;
    }

    const fetchProfile = async () => {
      try {
        dispatch(setLoading());
        const response = await doctorApi.get(`/profile/${doctor._id}`);
        dispatch(setProfile(response.data.data));
        setFormData(response.data.data); // Pre-fill form with current data
      } catch (err) {
        dispatch(setError("Failed to fetch doctor profile."));
      }
    };

    fetchProfile();
  }, [dispatch, doctor]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle save profile update
  const handleSave = async () => {
    try {
      const response = await doctorApi.put(`/updateProfile/${doctor?._id}`, formData);
      dispatch(setProfile(response.data.updatedProfile)); // Update Redux state
      setEditMode(false); // Exit edit mode
    } catch (err) {
      console.error("Profile update failed:", err);
      dispatch(setError("Profile update failed."));
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
          {formData?.name || "Dr. Name"}
        </h2>
        <p className="text-gray-500">{formData?.email || "email@doctor.com"}</p>
        <p className="text-gray-500">{formData?.phone || "+XXX XXX XXX XXX"}</p>

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

      {/* Right Side - Profile Form (Always Visible but Read-Only) */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-2/3 ml-0 md:ml-6 mt-6 md:mt-0">
        <h3 className="text-xl font-semibold mb-4">Profile Details</h3>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border rounded-md"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <label className="text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              className="w-full p-2 border rounded-md"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <label className="text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border rounded-md"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <label className="text-gray-600">Qualification</label>
            <input
              type="text"
              name="qualification"
              className="w-full p-2 border rounded-md"
              placeholder="Enter your qualification"
              value={formData.qualification}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <label className="text-gray-600">Specialization</label>
            <input
              type="text"
              name="specialization"
              className="w-full p-2 border rounded-md"
              placeholder="Enter your specialization"
              value={formData.specialization}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>
        </div>

        {/* Action Buttons (Show Only in Edit Mode) */}
        {editMode && (
          <div className="mt-6 flex justify-between">
            <button
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md"
              onClick={handleSave}
            >
              <CheckCircle size={16} /> Save Changes
            </button>
            <button
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-md"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
