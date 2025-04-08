import React from "react";
import {
  Calendar,
  Tag,
  User,
  MessageSquare,
  LogOut,
  ChevronDown,
} from "lucide-react";
import MenuItem from "./MenuItem"; // adjust the path if needed
import { useNavigate } from "react-router-dom";
import Footer from "../CommonComponents/Footer";
import api from "../../axios/UserInstance";
import { logoutUser } from "../../slice/user/userSlice";
import { useDispatch } from "react-redux";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleLogout = async () => {
      try {
        await api.post("/logout");
        dispatch(logoutUser());
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

  return (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <div className="px-6 py-6">
          <div className="flex items-center space-x-2 mb-4"></div>
          <div className="max-w-xs w-full mx-auto space-y-4">
            <button onClick={() => navigate(-1)} className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold flex items-center justify-center space-x-2">
              <span>←</span>
              <span>Back</span>
            </button>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold">
              Dashboard
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="px-6 mt-6 space-y-4 text-sm text-blue-700">
          <MenuItem
            icon={<Calendar size={18} />}
            label="Appointments"
            to="/my-aappointments"
          />
          <MenuItem icon={<User size={18} />} label="Profile" to="/my-profile" />

          <MenuItem
            icon={<MessageSquare size={18} />}
            label="Messages"
            to="/my-profile"
          />
          <MenuItem icon={<LogOut size={18} />} label="Logout" onClick={handleLogout} />
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
