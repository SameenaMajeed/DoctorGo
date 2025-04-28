import React, { useState } from "react";
import {
  Calendar,
  User,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import MenuItem from "./MenuItem";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../axios/UserInstance";
import { logoutUser } from "../../slice/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";

interface MenuItemType {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.user.user);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      dispatch(logoutUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const menuItems: MenuItemType[] = [
    {
      icon: <Calendar size={18} />,
      label: "Appointments",
      path: "/my-appointments",
    },
    { icon: <User size={18} />, label: "Profile", path: "/my-profile" },
    {
      icon: <MessageSquare size={18} />,
      label: "Conversations",
      path: "/my-chats",
    },
    {
      icon: <ClipboardList size={18} />,
      label: "Get Prescription",
      path: "/prescriptionDownload",
    },
  ];

  const footerItems: MenuItemType[] = [
    {
      icon: <HelpCircle size={18} />,
      label: "Help & Support",
      path: "/support",
    },
  ];

  return (
    <div>
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-72"
        } h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 `}
      >
        {/* Collapse Toggle */}
        {/* <div className="flex justify-end px-2"> */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        {/* </div> */}

        {/* Navigation Shortcuts */}
        {!isCollapsed && (
          <div className="p-4 space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <ChevronLeft size={18} className="mr-2 text-gray-700" />
              <span className="text-gray-700 font-medium">Back</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center px-4 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Home size={18} className="mr-2 text-blue-600" />
              <span className="text-blue-600 font-medium">Home Page</span>
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-1">
          {!isCollapsed && (
            <h3 className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Menu
            </h3>
          )}

          {menuItems.map(({ icon, label, path }) => (
            <div
              key={path}
              className={isCollapsed ? "justify-center p-3" : "px-4 py-3"}
            >
              <MenuItem
                icon={React.cloneElement(icon as React.ReactElement, {
                  className: isActive(path) ? "text-blue-600" : "text-gray-600",
                })}
                label={isCollapsed ? "" : label}
                to={path}
              />
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t border-gray-200 space-y-1">
          {footerItems.map(({ icon, label, path }) => (
            <div
              key={path}
              className={isCollapsed ? "justify-center p-3" : "px-4 py-3"}
            >
              <MenuItem
                icon={React.cloneElement(icon as React.ReactElement, {
                  className: isActive(path) ? "text-blue-600" : "text-gray-600",
                })}
                label={isCollapsed ? "" : label}
                to={path}
              />
            </div>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center p-3" : "px-4 py-3"
            } text-red-600 hover:bg-red-50 rounded-lg transition`}
            aria-label="Logout"
          >
            <LogOut size={18} className={isCollapsed ? "" : "mr-3"} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
            {/* User Info */}
      <div className="flex-1 fixed bottom-1 ">
        {user && (
          <div className="hidden md:block px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3 ">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-[180px] ">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;

// import React from "react";
// import {
//   Calendar,
//   User,
//   MessageSquare,
//   LogOut,
//   ChevronLeft,
//   Home,
//   Settings,
//   HelpCircle,
// } from "lucide-react";
// import MenuItem from "./MenuItem";
// import { useNavigate, useLocation } from "react-router-dom";
// import api from "../../axios/UserInstance";
// import { logoutUser } from "../../slice/user/userSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";

// const Sidebar: React.FC = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const location = useLocation();

//   const user = useSelector((state: RootState) => state.user.user);

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

//   return (
//     <div className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">
//       {/* Header */}
//       {/* <div className="px-6 py-6 border-b border-gray-200">
//         <h1 className="text-xl font-bold text-gray-800 flex items-center">
//           <span className="bg-blue-600 text-white p-2 rounded-lg mr-3">
//             <User size={20} />
//           </span>
//           User Dashboard
//         </h1>
//       </div> */}

//       {/* Navigation Buttons */}
//       <div className="p-4 space-y-2">
//         <button
//           onClick={() => navigate(-1)}
//           className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
//         >
//           <div className="flex items-center">
//             <ChevronLeft size={18} className="mr-2 text-gray-700" />
//             <span className="font-medium text-gray-700">Back</span>
//           </div>
//         </button>

//         <button
//           onClick={() => navigate("/")}
//           className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
//         >
//           <div className="flex items-center">
//             <Home size={18} className="mr-2 text-blue-600" />
//             <span className="font-medium text-blue-600">Home Page</span>
//           </div>
//         </button>
//       </div>

//       {/* Main Menu */}
//       <nav className="flex-1 px-4 py-2 space-y-1">
//         <h3 className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//           Menu
//         </h3>

//         <div
//           className={
//             isActive("/my-appointments")
//               ? "bg-blue-50 text-blue-600 rounded-lg"
//               : ""
//           }
//         >
//           <MenuItem
//             icon={
//               <Calendar
//                 size={18}
//                 className={
//                   isActive("/my-appointments")
//                     ? "text-blue-600"
//                     : "text-gray-600"
//                 }
//               />
//             }
//             label="Appointments"
//             to="/my-appointments"
//           />
//         </div>

//         <div
//           className={
//             isActive("/my-profile")
//               ? "bg-blue-50 text-blue-600 rounded-lg"
//               : ""
//           }
//         >
//           <MenuItem
//             icon={
//               <User
//                 size={18}
//                 className={
//                   isActive("/my-profile") ? "text-blue-600" : "text-gray-600"
//                 }
//               />
//             }
//             label="Profile"
//             to="/my-profile"
//           />
//         </div>

//         <div
//           className={
//             isActive("/my-chats") ? "bg-blue-50 text-blue-600 rounded-lg" : ""
//           }
//         >
//           <MenuItem
//             icon={
//               <MessageSquare
//                 size={18}
//                 className={
//                   isActive("/my-chats") ? "text-blue-600" : "text-gray-600"
//                 }
//               />
//             }
//             label="Conversations"
//             to="/my-chats"
//           />
//         </div>

//         <div
//           className={
//             isActive("/settings") ? "bg-blue-50 text-blue-600 rounded-lg" : ""
//           }
//         >
//           <MenuItem
//             icon={
//               <Settings
//                 size={18}
//                 className={
//                   isActive("/settings") ? "text-blue-600" : "text-gray-600"
//                 }
//               />
//             }
//             label="Settings"
//             to="/settings"
//           />
//         </div>
//       </nav>

//       {/* Footer Menu */}
//       <div className="px-4 py-4 border-t border-gray-200 space-y-1">
//         <div className={isActive("/support") ? "bg-blue-50 text-blue-600 rounded-lg" : ""}>
//           <MenuItem
//             icon={
//               <HelpCircle
//                 size={18}
//                 className={
//                   isActive("/support") ? "text-blue-600" : "text-gray-600"
//                 }
//               />
//             }
//             label="Help & Support"
//             to="/support"
//           />
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//         >
//           <span className="mr-3">
//             <LogOut size={18} className="text-red-600" />
//           </span>
//           <span className="font-medium">Logout</span>
//         </button>
//       </div>

//       {/* User Info */}
//       {user && (
//         <div className="hidden md:block px-4 py-3 bg-gray-50 border-t border-gray-200">
//           <div className="flex items-center">
//             <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden">
//               {user.profilePicture ? (
//                 <img
//                   src={user.profilePicture}
//                   alt={user.name}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <User size={16} className="text-blue-600" />
//               )}
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
//                 {user.name}
//               </p>
//               <p className="text-xs text-gray-500 truncate max-w-[180px]">
//                 {user.email}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Sidebar;
