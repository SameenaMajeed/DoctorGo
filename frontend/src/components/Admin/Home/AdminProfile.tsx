import React from "react";
import profilePic from "../../../assets/profile_pic.png"
import { ChevronDown } from "lucide-react"; // For the dropdown icon

const AdminProfile: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 cursor-pointer">
      {/* Profile Image */}
      <img
        src={profilePic}
        alt="Admin"
        className="w-8 h-8 rounded-full"
      />
      {/* Name with Dropdown Icon */}
      <span className="text-gray-800 font-medium flex items-center">
        Hello Admin
        <ChevronDown size={16} className="ml-1 text-gray-600" />
      </span>
    </div>
  );
};

export default AdminProfile;
