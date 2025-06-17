import React, { useState } from "react";
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
} from "lucide-react";
import MenuItem from "./MenuItem";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../axios/UserInstance";
import { logoutUser } from "../../slice/user/userSlice";
import { useDispatch } from "react-redux";

interface IMenuItemType {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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

  const menuItems: IMenuItemType[] = [
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
      icon: <Wallet size={18} />,
      label: "Wallet",
      path: "/wallet",
    },
    {
      icon: <ClipboardList size={18} />,
      label: "Get Prescription",
      path: "/prescriptionDownload",
    },
  ];

  return (
    <aside
      className={`flex flex-col ${
        isCollapsed ? "w-20" : "w-72"
      } h-screen bg-white border-r border-gray-200 transition-all duration-300`}
    >
      {/* Top Section: Toggle + Navigation */}
      <div>
        {/* <div className="p-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div> */}

        {!isCollapsed && (
          <div className="p-4 space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <ChevronLeft size={18} className="mr-2 text-gray-700" />
              <span className="text-gray-700 font-medium">Back</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center px-4 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg"
            >
              <Home size={18} className="mr-2 text-blue-600" />
              <span className="text-blue-600 font-medium">Home Page</span>
            </button>
          </div>
        )}
      </div>

      {/* Middle: Navigation Menu */}
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

        <div className="border-t border-gray-200 space-y-1">
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
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
