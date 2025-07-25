"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Calendar,
  Menu,
  Clock,
  PlusCircle,
  MessageCircle,
  ChevronRight,
  X,
  IndianRupee,
  Coins,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../slice/Store/Store";
import toast from "react-hot-toast";

interface SidebarProps {
  onRestrictedAction?: () => void;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  badge?: number;
  children?: React.ReactNode;
  isExpandable?: boolean;
}

const EnhancedSidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  label,
  collapsed,
  active = false,
  onClick,
  badge,
  children,
  isExpandable = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isExpandable) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
    onClick?.(e);
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ x: collapsed ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Link
          to={href}
          onClick={handleClick}
          className={`
            flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 group relative overflow-hidden
            ${
              active
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600"
            }
          `}
        >
          {/* Background glow effect for active item */}
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl blur-xl"
            />
          )}

          <div className="relative z-10 flex items-center w-full">
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                }
              `}
            >
              {icon}
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center justify-between flex-1 ml-3"
                >
                  <span className="font-medium text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    {badge && badge > 0 && (
                      <span
                        className={`
                          inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                          ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-red-500 text-white"
                          }
                        `}
                      >
                        {badge}
                      </span>
                    )}
                    {isExpandable && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </motion.div>

      {/* Expandable children */}
      <AnimatePresence>
        {isExpandable && isExpanded && !collapsed && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-2 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
          {badge && badge > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = () => {
  const [collapsed, setCollapsed] = useState(false);
  // const [showUserMenu, setShowUserMenu] = useState(false);
  const { doctor } = useSelector((state: RootState) => state.doctor);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to restrict access to non-approved doctors
  const handleRestrictedNavigation = (e: React.MouseEvent, _path: string) => {
    if (!doctor?.isApproved) {
      e.preventDefault();
      toast.error(
        "Your account is pending approval. Please wait for admin approval."
      );
      navigate("/doctor/pending-approval");
    }
  };

  const doctorId = doctor?._id;
  const appointmentsPath = doctorId ? `/doctor/${doctorId}/appointments` : "#";
  const patientPath = doctorId ? `/doctor/${doctorId}/patients` : "#";
  // const review = doctorId ? `/doctor/reviews/${doctorId}` : "#";

  // const handleLogout = () => {
  //   // Add your logout logic here
  //   toast.success("Logged out successfully");
  //   navigate("/doctor/login");
  // };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`
        h-full bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl transition-all duration-300 relative
        ${collapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 -z-10" />

      {/* Header Section */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
              >
                <Link to="/doctor/home" className="flex items-center">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className={`transition-all duration-300 ${
                      collapsed ? "w-10 h-10" : "w-32 h-12"
                    }`}
                  />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <EnhancedSidebarItem
          href="/doctor/home"
          icon={<Home className="w-5 h-5" />}
          label="Dashboard"
          collapsed={collapsed}
          active={location.pathname === "/doctor/home"}
        />

        {/* Quick Stats */}
        {/* {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-4 my-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
          > */}
        {/* <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">24</div>
                <div className="text-xs text-green-600">Today's Patients</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">156</div>
                <div className="text-xs text-blue-600">This Month</div>
              </div>
            </div> */}
        {/* </motion.div>
        )} */}

        {/* Slot Management Section */}
        <div className="px-4 py-2">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Slot Management
            </p>
          )}

          <div className="space-y-1">
            <EnhancedSidebarItem
              href="/doctor/slots"
              icon={<Clock className="w-5 h-5" />}
              label="Manage Slots"
              collapsed={collapsed}
              active={location.pathname === "/doctor/slots"}
              onClick={(e) => handleRestrictedNavigation(e, "/doctor/slots")}
            />

            <EnhancedSidebarItem
              href="/doctor/slots/create"
              icon={<PlusCircle className="w-5 h-5" />}
              label="Create Slot"
              collapsed={collapsed}
              active={location.pathname === "/doctor/slots/create"}
              onClick={(e) =>
                handleRestrictedNavigation(e, "/doctor/slots/create")
              }
            />
          </div>
        </div>

        {/* Patient Management Section */}
        <div className="px-4 py-2">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Patient Care
            </p>
          )}

          <div className="space-y-1">
            <EnhancedSidebarItem
              href={appointmentsPath}
              icon={<Calendar className="w-5 h-5" />}
              label="Appointments"
              collapsed={collapsed}
              active={location.pathname === appointmentsPath}
              onClick={(e) => handleRestrictedNavigation(e, appointmentsPath)}
              // badge={notificationCount}
            />

            <EnhancedSidebarItem
              href={patientPath}
              icon={<Users className="w-5 h-5" />}
              label="Patients"
              collapsed={collapsed}
              active={location.pathname === patientPath}
              onClick={(e) => handleRestrictedNavigation(e, patientPath)}
            />

            <EnhancedSidebarItem
              href="/myChats"
              icon={<MessageCircle className="w-5 h-5" />}
              label="Messages"
              collapsed={collapsed}
              active={location.pathname === "/myChats"}
              onClick={(e) => handleRestrictedNavigation(e, "/myChats")}
              // badge={unreadMessages}
            />

            <EnhancedSidebarItem
              href="/payment"
              icon={<IndianRupee className="w-5 h-5" />}
              label="Payment"
              collapsed={collapsed}
              active={location.pathname === "/payment"}
              onClick={(e) => handleRestrictedNavigation(e, "/payment")}
            />
            <EnhancedSidebarItem
              href="/doctor/revenue"
              icon={<Coins className="w-5 h-5" />}
              label="Revenue"
              collapsed={collapsed}
              active={location.pathname === "/doctor/revenue"}
              onClick={(e) => handleRestrictedNavigation(e, "/doctor/revenue")}
            />
          </div>
        </div>

        {/* Analytics Section */}
        {/* <div className="px-4 py-2"> */}
          {/* {!collapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Analytics
            </p>
          )} */}

          {/* <div className="space-y-1"> */}
            {/* <EnhancedSidebarItem
              href={review}
              icon={<Star className="w-5 h-5" />}
              label="Reviews"
              collapsed={collapsed}
              active={location.pathname === review}
              onClick={(e) => handleRestrictedNavigation(e, review)}
            /> */}

            {/* <EnhancedSidebarItem
              href="/doctor/analytics"
              icon={<Activity className="w-5 h-5" />}
              label="Analytics"
              collapsed={collapsed}
              active={location.pathname === "/doctor/analytics"}
              onClick={(e) => handleRestrictedNavigation(e, "/doctor/analytics")}
            /> */}
          {/* </div>
        </div> */}
      </nav>

      {/* Bottom Section */}
      {/* <div className="p-4 border-t border-gray-200/50 space-y-2"> */}
        {/* Logout Button */}
        {/* <motion.button
          whileHover={{ x: collapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 mx-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-200">
            <LogOut className="w-5 h-5" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 font-medium text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button> */}

        {/* Approval Status Banner */}
        {/* {!doctor?.isApproved && !collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
          >
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-xs font-semibold text-yellow-800">
                  Pending Approval
                </p>
                <p className="text-xs text-yellow-600">
                  Some features are restricted
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div> */}
    </motion.div>
  );
};

export default Sidebar;

// import React, { useState } from "react";
// import {
//   Home,
//   Users,
//   Calendar,
//   Menu,
//   Clock,
//   PlusCircle,
// } from "lucide-react";
// import SidebarItem from "./SideBarItem";
// import { Link, useLocation, useNavigate,} from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../slice/Store/Store";
// import toast from "react-hot-toast";

// interface SidebarProps {
//   onRestrictedAction?: () => void;
// }

// const Sidebar: React.FC<SidebarProps> = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const { doctor } = useSelector((state: RootState) => state.doctor);
//   // const { user } = useSelector((state: RootState) => state.user);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Function to restrict access to non-approved doctors
//   const handleRestrictedNavigation = (e: React.MouseEvent, path: string) => {
//     if (!doctor?.isApproved) {
//       e.preventDefault(); // Prevent navigation
//       toast.error("Your account is pending approval.");
//       navigate("/doctor/pending-approval");
//     }
//   };
//   const doctorId = doctor?._id;
//   console.log("doctorId from sideBar :", doctorId);

//   // const userId = user?.id

//   const appointmentsPath = doctorId ? `/doctor/${doctorId}/appointments` : "#";
//   const patientPath = doctorId ? `/doctor/${doctorId}/patients` : "#";
//   const review = doctorId ? `/doctor/reviews/${doctorId}` : "#";

//   return (
//     <div
//       className={`h-full bg-white text-white transition-all duration-300 ${
//         collapsed ? "w-20" : "w-64"
//       }`}
//     >

//       {/* Logo Section */}
//       <div className="flex items-center justify-between p-3">
//         <Link to="/doctor/home">
//           <img
//             src="/logo.png"
//             alt="Logo"
//             className={`transition-all duration-300 ${
//               collapsed ? "w-10 h-10" : "w-32 h-12"
//             }`}
//           />
//         </Link>
//         {/* Toggle Button */}
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="p-2 rounded-md hover:bg-gray-100"
//         >
//           <Menu size={24} />
//         </button>
//       </div>

//       {/* Navigation Items */}
//       <nav className="flex-1 space-y-3 mt-4">
//         {/* Dashboard (Always Accessible) */}
//         <SidebarItem
//           href="/doctor/home"
//           icon={<Home size={20} />}
//           label="Dashboard"
//           collapsed={collapsed}
//           active={location.pathname === "/doctor/home"}
//         />

//         <div className="py-2">
//           <p
//             className={`px-3 text-xs text-gray-500 mb-2 ${
//               collapsed ? "hidden" : "block"
//             }`}
//           >
//             Slot Management
//           </p>
//           <SidebarItem
//             href="/doctor/slots"
//             icon={<Clock size={20} />}
//             label="Manage Slots"
//             collapsed={collapsed}
//             active={location.pathname === "/doctor/slots"}
//             onClick={(e) => handleRestrictedNavigation(e, "/doctor/slots")}
//           />
//           {/* <SidebarItem
//             href="/doctor/time-slots"
//             icon={<Clock size={20} />}
//             label="Offline Time Slots"
//             collapsed={collapsed}
//             active={location.pathname === "/doctor/time-slots"}
//             onClick={(e) => handleRestrictedNavigation(e, "/doctor/time-slots")}
//           /> */}
//           <SidebarItem
//             href="/doctor/slots/create"
//             icon={<PlusCircle size={20} />}
//             label="Create Slot"
//             collapsed={collapsed}
//             active={location.pathname === "/doctor/slots/create"}
//             onClick={(e) =>
//               handleRestrictedNavigation(e, "/doctor/slots/create")
//             }
//           />
//           {/* <SidebarItem
//             href="/doctor/slots/calendar"
//             icon={<Calendar size={20} />}
//             label="Slot Calendar"
//             collapsed={collapsed}
//             active={location.pathname === "/doctor/slots/calendar"}
//             onClick={(e) => handleRestrictedNavigation(e, "/doctor/slots/calendar")}
//           />
//           <SidebarItem
//             href="/doctor/slots/emergency"
//             icon={<AlertCircle size={20} />}
//             label="Emergency Block"
//             collapsed={collapsed}
//             active={location.pathname === "/doctor/slots/emergency"}
//             onClick={(e) => handleRestrictedNavigation(e, "/doctor/slots/emergency")}
//           /> */}
//         </div>

//         <SidebarItem
//           href={appointmentsPath}
//           icon={<Users size={20} />}
//           label="Appointments"
//           collapsed={collapsed}
//           active={location.pathname === appointmentsPath}
//           onClick={(e) => handleRestrictedNavigation(e, appointmentsPath)}
//         />

//         {/* Restricted Pages */}
//         <SidebarItem
//           href={patientPath}
//           icon={<Users size={20} />}
//           label="Patients"
//           collapsed={collapsed}
//           active={location.pathname === patientPath}
//           onClick={(e) => handleRestrictedNavigation(e, patientPath)}
//         />
//         <SidebarItem
//           href="/myChats"
//           icon={<Calendar size={20} />}
//           label="Conversation"
//           collapsed={collapsed}
//           active={location.pathname === "/myChats"}
//           onClick={(e) => handleRestrictedNavigation(e, "/myChats")}
//         />
//         <SidebarItem
//           href={review}
//           icon={<Calendar size={20} />}
//           label="Review"
//           collapsed={collapsed}
//           active={location.pathname === review}
//           onClick={(e) => handleRestrictedNavigation(e, review)}
//         />
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;
