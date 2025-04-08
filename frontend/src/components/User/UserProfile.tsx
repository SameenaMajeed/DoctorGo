import React, { useState } from "react";
import Navbar from "./Home/Navbar";
import Sidebar from "./SideBar";
import TextInput from "../CommonComponents/TextInput";
import TextArea from "../CommonComponents/TextArea";
import SelectInput from "../CommonComponents/SelectInput";
import Footer from "../CommonComponents/Footer";

const UserProfile: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "Dr.",
    fullName: "Daudi Mburuge",
    phone: "+254 712 345 678",
    email: "daudimburuge@gmail.com",
    address: "57th Cross, Richmond Circle, Church Road, London",
    gender: "Male",
    birthday: "2024-07-20",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    alert("Changes saved successfully!");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navbar />
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="bg-gray-100 rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
            {/* Left Panel */}
            <section className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r text-center">
              <div className="w-28 h-28 mx-auto mb-4">
                <img
                  src={
                    imagePreview ||
                    "https://images.unsplash.com/photo-1614287433174-2647e0b15bdf?auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80"
                  }
                  alt="Profile"
                  className="rounded-full object-cover w-full h-full"
                />
              </div>
              <h2 className="text-lg font-semibold">
                {formData.title} {formData.fullName}
              </h2>
              <p className="text-sm text-gray-500">{formData.email}</p>
              <p className="text-sm text-gray-500">{formData.phone}</p>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-md font-medium transition">
                  👤 Personal Information
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition">
                  🔒 Change Password
                </button>
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
            </section>

            {/* Right Panel */}
            <section className="md:w-2/3 p-6">
              {/* Contact Info */}
              <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <TextInput
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e: { target: { value: any; }; }) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <TextInput
                  id="phone"
                  label="Phone"
                  value={formData.phone}
                  onChange={(e: { target: { value: any; }; }) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <div className="md:col-span-2">
                  <TextArea
                    id="address"
                    label="Address"
                    value={formData.address}
                    onChange={(e: { target: { value: any; }; }) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Basic Info */}
              <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectInput
                  id="title"
                  label="Title"
                  value={formData.title}
                  onChange={(e: { target: { value: any; }; }) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  options={["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."]}
                />
                <TextInput
                  id="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e: { target: { value: any; }; }) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
                <SelectInput
                  id="gender"
                  label="Gender"
                  value={formData.gender}
                  onChange={(e: { target: { value: any; }; }) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  options={["Male", "Female", "Other"]}
                />
                <TextInput
                  id="birthday"
                  label="Birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e: { target: { value: any; }; }) =>
                    setFormData({ ...formData, birthday: e.target.value })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-md flex items-center space-x-2 transition"
                >
                  🗑️ <span>Delete Account</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center space-x-2 transition"
                >
                  ✅ <span>Save Changes</span>
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>

    </div>
  );
};

export default UserProfile;
