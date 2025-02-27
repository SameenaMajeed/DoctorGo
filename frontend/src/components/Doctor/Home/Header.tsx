import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <input
          type="text"
          placeholder='Search "Patients"...'
          className="w-72 p-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            5
          </span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <img
            src="/user-avatar.jpg"
            alt="User"
            className="w-10 h-10 rounded-full cursor-pointer border"
            onClick={() => setIsOpen(!isOpen)}
          />

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
              <ul className="py-2 text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"> <Link to="/doctor/profile">My Profile</Link></li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">My Appointments</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Messages</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"><Link to="/doctor">Logout</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
