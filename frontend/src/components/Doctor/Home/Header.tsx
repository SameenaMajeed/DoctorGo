"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Settings,
  User,
  LogOut,
  Calendar,
  MessageCircle,
  ChevronDown,
  Sun,
  Moon,
  Shield,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../../slice/Store/Store"
// import doctorApi from "../../../axios/DoctorInstance"
import { logoutDoctor } from "../../../slice/Doctor/doctorSlice"
import NotificationBell from "../../CommonComponents/NotificationBell"
import toast from "react-hot-toast"
import { createApiInstance } from "../../../axios/apiService"

const doctorApi = createApiInstance("doctor");

const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const doctor = useSelector((state: RootState) => state.doctor.doctor)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await doctorApi.post("/logout")
      dispatch(logoutDoctor())
      toast.success("Logged out successfully")
      navigate("/doctor")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Logout failed")
    }
  }

  const doctorId = doctor?._id
  const appointmentsPath = doctorId ? `/doctor/${doctorId}/appointments` : "#"

  const profileMenuItems = [
    {
      icon: User,
      label: "My Profile",
      href: "/doctor/profile",
      color: "text-blue-600",
    },
    {
      icon: Calendar,
      label: "My Appointments",
      href: appointmentsPath,
      color: "text-green-600",
    },
    {
      icon: MessageCircle,
      label: "Messages",
      href: "/myChats",
      color: "text-purple-600",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/doctor/settings",
      color: "text-gray-600",
    },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg relative z-40"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients, appointments, or records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <NotificationBell />
          </div>

          {/* Quick Stats */}
          {/* <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Online</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>
          </div> */}

          {/* Profile Dropdown */}
          <div className="relative z-50" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="relative">
                <img
                  src={doctor?.profilePicture || "/placeholder.svg?height=40&width=40"}
                  alt={doctor?.name || "Doctor Profile"}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-lg"
                />
                {doctor?.isApproved ? (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                ) : (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="font-semibold text-gray-900 text-sm">{doctor?.name}</p>
                <p className="text-xs text-gray-500">{doctor?.specialization}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden z-[9999]"
                  style={{ zIndex: 9999 }}
                >
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor?.profilePicture || "/placeholder.svg?height=48&width=48"}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                      />
                      <div>
                        <p className="font-semibold">{doctor?.name}</p>
                        <p className="text-sm text-blue-100">{doctor?.specialization}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {doctor?.isApproved ? (
                            <>
                              <Shield className="w-3 h-3 text-green-300" />
                              <span className="text-xs text-green-300">Verified</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-3 h-3 text-yellow-300" />
                              <span className="text-xs text-yellow-300">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    {profileMenuItems.map((item, index) => {
                      const IconComponent = item.icon
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            to={item.href}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group"
                          >
                            <div
                              className={`w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                          </Link>
                        </motion.div>
                      )
                    })}

                    {/* Divider */}
                    <div className="my-2 border-t border-gray-200" />

                    {/* Logout */}
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 rounded-xl transition-colors group text-left"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-red-600 group-hover:text-red-700">Logout</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header



// import React, { useState } from "react";
// import { Bell } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../../slice/Store/Store";
// import doctorApi from "../../../axios/DoctorInstance";
// import { logoutDoctor } from "../../../slice/Doctor/doctorSlice";
// import NotificationBell from "../../CommonComponents/NotificationBell";

// const Header: React.FC = () => {
//   console.log('Header..')
//   const [isOpen, setIsOpen] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const doctor = useSelector((state: RootState) => state.doctor.doctor);
  

//   const handleLogout = async () => {
//     try {
//       await doctorApi.post("/logout");
//       dispatch(logoutDoctor());
//       navigate("/login");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };
//   const doctorId = doctor?._id;
//   const appointmentsPath = doctorId ? `/doctor/${doctorId}/appointments` : "#";


//   return (
//     <header className="flex items-center justify-between bg-white shadow px-6 py-4">
//       {/* Left: Search */}
//       <div className="flex items-center gap-4 flex-1">
//         {/* <input
//           type="text"
//           placeholder='Search "Patients"...'
//           className="w-72 p-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-green-400"
//         /> */}
//       </div>

//       {/* Right: Notifications & Profile */}
//       <div className="flex items-center space-x-6">
//         {/* Notifications */}
//         <div className="relative">
//           <NotificationBell/>
//         </div>

//         {/* Profile Dropdown */}
//         <div className="relative">
//           <img
//             src={doctor?.profilePicture || '/default-avatar.png'}
//             alt={doctor?.name || 'User Profile'}
//             className="w-10 h-10 rounded-full cursor-pointer border"
//             onClick={() => setIsOpen(!isOpen)}
            
//           />

//           {isOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
//               <ul className="py-2 text-gray-700">
//                 <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"> <Link to="/doctor/profile">My Profile</Link></li>
//                 <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"> <Link to={appointmentsPath}>My Appointments</Link></li>
//                 <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Messages</li>
//                 <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500" onClick={handleLogout}>Logout</li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
