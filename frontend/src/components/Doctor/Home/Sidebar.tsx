import React, { useState } from "react";
import { Home, Users, Calendar, Menu } from "lucide-react";
import SidebarItem from "./SideBarItem";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`h-screen bg-white shadow-md border-r transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Logo Button */}
      <div className="flex items-center justify-center p-3">
        <Link to="/dashboard">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className={`transition-all duration-300 ${collapsed ? "w-10 h-10" : "w-32 h-12"}`}
          />
        </Link>
      </div>

      {/* Toggle Button */}
      {/* <button 
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 flex items-center justify-center hover:bg-gray-100 w-full"
      >
        <Menu size={24} />
      </button> */}

      {/* Navigation */}
      <nav className="flex-1 space-y-3 mt-4">
        <SidebarItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" collapsed={collapsed} />
        <SidebarItem href="/patients" icon={<Users size={20} />} label="Patients" collapsed={collapsed} />
        <SidebarItem href="/time-fees" icon={<Calendar size={20} />} label="Time & Fees" collapsed={collapsed} />
      </nav>
    </div>
  );
};

export default Sidebar;
