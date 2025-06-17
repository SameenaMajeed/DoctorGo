import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../slice/Store/Store";
import doctorApi from "../../../axios/DoctorInstance";
import { logoutDoctor } from "../../../slice/Doctor/doctorSlice";
import NotificationBell from "../../CommonComponents/NotificationBell";

const Header: React.FC = () => {
  console.log('Header..')
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const doctor = useSelector((state: RootState) => state.doctor.doctor);
  

  const handleLogout = async () => {
    try {
      await doctorApi.post("/logout");
      dispatch(logoutDoctor());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const doctorId = doctor?._id;
  const appointmentsPath = doctorId ? `/doctor/${doctorId}/appointments` : "#";


  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* <input
          type="text"
          placeholder='Search "Patients"...'
          className="w-72 p-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-green-400"
        /> */}
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="relative">
          <NotificationBell/>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <img
            src={doctor?.profilePicture || '/default-avatar.png'}
            alt={doctor?.name || 'User Profile'}
            className="w-10 h-10 rounded-full cursor-pointer border"
            onClick={() => setIsOpen(!isOpen)}
            
          />

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
              <ul className="py-2 text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"> <Link to="/doctor/profile">My Profile</Link></li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"> <Link to={appointmentsPath}>My Appointments</Link></li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Messages</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500" onClick={handleLogout}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
