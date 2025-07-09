"use client"

import React, { useState } from "react"
import {
  Calendar,
  User,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardList,
  Wallet,
} from "lucide-react"
import MenuItem from "./MenuItem"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../../axios/UserInstance"
import { logoutUser } from "../../slice/user/userSlice"
import { useDispatch } from "react-redux"

interface IMenuItemType {
  icon: React.ReactNode
  label: string
  path: string
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await api.post("/logout")
      dispatch(logoutUser())
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  const menuItems: IMenuItemType[] = [
    {
      icon: <Calendar size={20} />,
      label: "Appointments",
      path: "/my-appointments",
    },
    { icon: <User size={20} />, label: "Profile", path: "/my-profile" },
    {
      icon: <MessageSquare size={20} />,
      label: "Conversations",
      path: "/my-chats",
    },
    {
      icon: <Wallet size={20} />,
      label: "Wallet",
      path: "/wallet",
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Payment History",
      path: "/paymentHistory",
    },
  ]

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-80"
      } h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-xl transition-all duration-300 ease-in-out flex flex-col relative`}
    >
      {/* Toggle Button - Floating on the right side */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 w-6 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg shadow-lg transition-all duration-200 flex items-center justify-center group"
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronLeft size={14} className="group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 flex-shrink-0"></div>

      {/* Navigation Buttons */}
      {!isCollapsed && (
        <div className="p-6 space-y-3 border-b border-slate-100 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center px-4 py-3 bg-slate-100/70 hover:bg-slate-200/70 rounded-xl transition-all duration-200 hover:shadow-sm group"
          >
            <ChevronLeft size={18} className="mr-3 text-slate-600 group-hover:text-slate-800 transition-colors" />
            <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">Back</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 hover:shadow-sm group border border-blue-100/50"
          >
            <Home size={18} className="mr-3 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="text-blue-700 font-medium group-hover:text-blue-800 transition-colors">Home Page</span>
          </button>
        </div>
      )}

      {/* Navigation Menu - Scrollable middle section */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-6">
              <h3 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</h3>
              <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mt-2"></div>
            </div>
          )}

          <div className="space-y-2">
            {menuItems.map(({ icon, label, path }) => (
              <div key={path} className={`${isCollapsed ? "flex justify-center" : ""} transition-all duration-200`}>
                <div
                  className={`${
                    isActive(path)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  } ${
                    isCollapsed ? "p-3 rounded-xl" : "px-4 py-3 rounded-xl"
                  } transition-all duration-200 hover:shadow-md group cursor-pointer`}
                >
                  <MenuItem
                    icon={React.cloneElement(icon as React.ReactElement, {
                      className: `${
                        isActive(path) ? "text-white" : "text-slate-600 group-hover:text-slate-800"
                      } transition-colors duration-200`,
                    })}
                    label={isCollapsed ? "" : label}
                    to={path}
                  />
                </div>
              </div>
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
    </aside>
  )
}

export default Sidebar




// import React, { useState } from "react";
// import {
//   Calendar,
//   User,
//   MessageSquare,
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   Home,
//   ClipboardList,
//   Wallet,
// } from "lucide-react";
// import MenuItem from "./MenuItem";
// import { useNavigate, useLocation } from "react-router-dom";
// import api from "../../axios/UserInstance";
// import { logoutUser } from "../../slice/user/userSlice";
// import { useDispatch } from "react-redux";

// interface IMenuItemType {
//   icon: React.ReactNode;
//   label: string;
//   path: string;
// }

// const Sidebar: React.FC = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const location = useLocation();

//   const handleLogout = async () => {
//     try {
//       await api.post("/logout");
//       dispatch(logoutUser());
//       navigate("/login");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const isActive = (path: string) => location.pathname.startsWith(path);

//   const toggleSidebar = () => {
//     setIsCollapsed((prev) => !prev);
//   };

//   const menuItems: IMenuItemType[] = [
//     {
//       icon: <Calendar size={18} />,
//       label: "Appointments",
//       path: "/my-appointments",
//     },
//     { icon: <User size={18} />, label: "Profile", path: "/my-profile" },
//     {
//       icon: <MessageSquare size={18} />,
//       label: "Conversations",
//       path: "/my-chats",
//     },
//     {
//       icon: <Wallet size={18} />,
//       label: "Wallet",
//       path: "/wallet",
//     },
//     {
//       icon: <ClipboardList size={18} />,
//       label: "Payment History",
//       path: "/paymentHistory",
//     },
//   ];

//   return (
//     <aside
//       className={`flex flex-col ${
//         isCollapsed ? "w-20" : "w-72"
//       } h-screen bg-white border-r border-gray-200 transition-all duration-300`}
//     >
//       {/* Top Section: Toggle + Navigation */}
//       <div>
//         {/* <div className="p-2">
//           <button
//             onClick={toggleSidebar}
//             className="p-2 rounded-full hover:bg-gray-100"
//           >
//             {isCollapsed ? (
//               <ChevronRight size={20} />
//             ) : (
//               <ChevronLeft size={20} />
//             )}
//           </button>
//         </div> */}

//         {!isCollapsed && (
//           <div className="p-4 space-y-2">
//             <button
//               onClick={() => navigate(-1)}
//               className="w-full flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
//             >
//               <ChevronLeft size={18} className="mr-2 text-gray-700" />
//               <span className="text-gray-700 font-medium">Back</span>
//             </button>
//             <button
//               onClick={() => navigate("/")}
//               className="w-full flex items-center px-4 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg"
//             >
//               <Home size={18} className="mr-2 text-blue-600" />
//               <span className="text-blue-600 font-medium">Home Page</span>
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Middle: Navigation Menu */}
//       <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-1">
//         {!isCollapsed && (
//           <h3 className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
//             Menu
//           </h3>
//         )}
//         {menuItems.map(({ icon, label, path }) => (
//           <div
//             key={path}
//             className={isCollapsed ? "justify-center p-3" : "px-4 py-3"}
//           >
//             <MenuItem
//               icon={React.cloneElement(icon as React.ReactElement, {
//                 className: isActive(path) ? "text-blue-600" : "text-gray-600",
//               })}
//               label={isCollapsed ? "" : label}
//               to={path}
//             />
//           </div>
//         ))}

//         <div className="border-t border-gray-200 space-y-1">
//           <button
//             onClick={handleLogout}
//             className={`w-full flex items-center ${
//               isCollapsed ? "justify-center p-3" : "px-4 py-3"
//             } text-red-600 hover:bg-red-50 rounded-lg transition`}
//             aria-label="Logout"
//           >
//             <LogOut size={18} className={isCollapsed ? "" : "mr-3"} />
//             {!isCollapsed && <span className="font-medium">Logout</span>}
//           </button>
//         </div>
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;
