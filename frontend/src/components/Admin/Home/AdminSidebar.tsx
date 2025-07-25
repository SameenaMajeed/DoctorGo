"use client"

import type React from "react"
import { useState } from "react"
import {
  Home,
  Users,
  Stethoscope,
  CalendarCheck,
  CreditCard,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import Swal from "sweetalert2"
// import adminApi from "../../../axios/AdminInstance"
import { adminLogout } from "../../../slice/admin/adminSlice"
import MenuItem from "./MenuItem"
import { createApiInstance } from "../../../axios/apiService"

interface IMenuItemType {
  icon: React.ReactNode
  label: string
  path: string
}

const adminApi = createApiInstance("admin");

const AdminSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
    })

    if (!result.isConfirmed) return

    try {
      await adminApi.post("/logout")
      dispatch(adminLogout())
      Swal.fire("Logged Out!", "You have been successfully logged out.", "success")
      navigate("/admin")
    } catch (error) {
      Swal.fire("Error!", "Logout failed. Please try again.", "error")
      console.error("Logout failed:", error)
    }
  }

  const isActive = (path: string) => location.pathname.startsWith(path)
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  const menuItems: IMenuItemType[] = [
    {
      icon: <Home size={20} />,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: <Users size={20} />,
      label: "Users",
      path: "/admin/users",
    },
    {
      icon: <Stethoscope size={20} />,
      label: "Doctors",
      path: "/admin/doctors",
    },
    {
      icon: <CalendarCheck size={20} />,
      label: "Appointments",
      path: "/admin/appointments",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Payments",
      path: "/admin/payments",
    },
    {
      icon : <Activity className="w-5 h-5" />,
      label : "Analytics",
      path : "/admin/analytics"
    }
  ]

  return (
    <aside
      className={`${
        isCollapsed ? "w-[80px]" : "w-[250px]"
      }h-screen bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-xl transition-all duration-300 ease-in-out flex flex-col relative`}
    >
      {/* Toggle Button - Floating on the right side */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 w-6 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg shadow-lg transition-all duration-200 flex items-center justify-center group"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronLeft size={14} className="group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 flex-shrink-0" />

  

      {/* Logo Section */}
      <div className="relative z-10 flex flex-col p-6 pb-0">
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="DoctorGo" className="h-12 w-12 object-contain" />
          {!isCollapsed && (
            <>
              <h2 className="text-gray-800 font-bold text-xl">DoctorGo</h2>
              <p className="text-gray-500 text-sm font-medium">Admin Dashboard</p>
            </>
          )}
        </div>

        {/* Admin Badge - Only visible when expanded */}
        {!isCollapsed && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Administrator</p>
                  <p className="text-gray-500 text-xs">Full System Access</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu - Scrollable middle section */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-6">
              <h3 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</h3>
              <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mt-2" />
            </div>
          )}
          <div className="space-y-2">
            {menuItems.map(({ icon, label, path }) => (
              <MenuItem
                key={path}
                icon={icon}
                label={label}
                to={path}
                isCollapsed={isCollapsed}
                isActive={isActive(path)}
              />
            ))}
          </div>
        </nav>

        {/* Logout Button - Always visible at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center p-3" : "px-4 py-3"
            } text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md group border border-transparent hover:border-red-100`}
            aria-label="Logout"
          >
            <LogOut
              size={18}
              className={`${isCollapsed ? "" : "mr-3"} group-hover:scale-110 transition-transform duration-200`}
            />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Footer - Only visible when expanded */}
      {!isCollapsed && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-gray-400 text-xs">© 2024 DoctorGo Platform</p>
            <div className="flex items-center justify-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              <p className="text-gray-500 text-xs">System Online</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default AdminSidebar


// import React from "react";
// import {
//   Home,
//   Users,
//   Stethoscope,
//   CalendarCheck,
//   CreditCard,
//   LogOut,
// } from "lucide-react";
// import SidebarItem from "./SidebarItem";
// import { useNavigate } from "react-router-dom";
// import adminApi from "../../../axios/AdminInstance";
// import { useDispatch } from "react-redux";
// import { adminLogout } from "../../../slice/admin/adminSlice";
// import Swal from "sweetalert2";

// const AdminSidebar: React.FC = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleLogout = async () => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You will be logged out!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, logout!",
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await adminApi.post("/logout");
//       dispatch(adminLogout());
//       Swal.fire("Logged Out!", "You have been successfully logged out.", "success");
//       navigate("/admin");
//     } catch (error) {
//       Swal.fire("Error!", "Logout failed. Please try again.", "error");
//       console.error("Logout failed:", error);
//     }
//   };

//   return (
//     <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-5 flex flex-col border-r border-gray-200">
//       {/* Logo Section */}
//       <div className="mb-6 flex justify-center">
//         <img src="/logo.png" alt="DoctorGo" className="h-20" />
//       </div>

//       {/* Navigation Menu */}
//       <nav className="flex-1 space-y-2">
//         <SidebarItem href="/admin/dashboard" icon={<Home size={20} />} label="Dashboard" />
//         <SidebarItem href="/admin/users" icon={<Users size={20} />} label="Users" />
//         <SidebarItem href="/admin/doctors" icon={<Stethoscope size={20} />} label="Doctors" />
//         <SidebarItem href="/admin/appointments" icon={<CalendarCheck size={20} />} label="Appointments" />
//         <SidebarItem href="/admin/payments" icon={<CreditCard size={20} />} label="Payments" />
//         {/* <SidebarItem href="/admin/approvals" icon={<CheckCircle size={20} />} label="Approvals" /> */}
//         {/* <SidebarItem href="/admin/sales_report" icon={<BarChart size={20} />} label="Sales Report" />
//         <SidebarItem href="/admin/reports" icon={<FileText size={20} />} label="Reports" /> */}
//       </nav>

//       {/* Logout Button */}
//       <div className="mt-auto">
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-2 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg w-full"
//         >
//           <LogOut size={20} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdminSidebar;
