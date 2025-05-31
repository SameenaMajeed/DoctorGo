import React, { useState } from "react";
import {
  Home,
  Users,
  Calendar,
  Menu,
  Clock,
  PlusCircle,
} from "lucide-react";
import SidebarItem from "./SideBarItem";
import { Link, useLocation, useNavigate,} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../slice/Store/Store";
import toast from "react-hot-toast";

interface SidebarProps {
  onRestrictedAction?: () => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { doctor } = useSelector((state: RootState) => state.doctor);
  // const { user } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to restrict access to non-approved doctors
  const handleRestrictedNavigation = (e: React.MouseEvent, path: string) => {
    if (!doctor?.isApproved) {
      e.preventDefault(); // Prevent navigation
      toast.error("Your account is pending approval.");
      navigate("/doctor/pending-approval");
    }
  };
  const doctorId = doctor?._id;
  console.log("doctorId from sideBar :", doctorId);

  // const userId = user?.id


  const appointmentsPath = doctorId ? `/doctor/${doctorId}/appointments` : "#";
  const patientPath = doctorId ? `/doctor/${doctorId}/patients` : "#";
  const review = doctorId ? `/doctor/reviews/${doctorId}` : "#";


  return (
    <div
      className={`h-full bg-white text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      
      {/* Logo Section */}
      <div className="flex items-center justify-between p-3">
        <Link to="/doctor/home">
          <img
            src="/logo.png"
            alt="Logo"
            className={`transition-all duration-300 ${
              collapsed ? "w-10 h-10" : "w-32 h-12"
            }`}
          />
        </Link>
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-3 mt-4">
        {/* Dashboard (Always Accessible) */}
        <SidebarItem
          href="/doctor/home"
          icon={<Home size={20} />}
          label="Dashboard"
          collapsed={collapsed}
          active={location.pathname === "/doctor/home"}
        />

        <div className="py-2">
          <p
            className={`px-3 text-xs text-gray-500 mb-2 ${
              collapsed ? "hidden" : "block"
            }`}
          >
            Slot Management
          </p>
          <SidebarItem
            href="/doctor/slots"
            icon={<Clock size={20} />}
            label="Manage Slots"
            collapsed={collapsed}
            active={location.pathname === "/doctor/slots"}
            onClick={(e) => handleRestrictedNavigation(e, "/doctor/slots")}
          />
          {/* <SidebarItem
            href="/doctor/time-slots"
            icon={<Clock size={20} />}
            label="Offline Time Slots"
            collapsed={collapsed}
            active={location.pathname === "/doctor/time-slots"}
            onClick={(e) => handleRestrictedNavigation(e, "/doctor/time-slots")}
          /> */}
          <SidebarItem
            href="/doctor/slots/create"
            icon={<PlusCircle size={20} />}
            label="Create Slot"
            collapsed={collapsed}
            active={location.pathname === "/doctor/slots/create"}
            onClick={(e) =>
              handleRestrictedNavigation(e, "/doctor/slots/create")
            }
          />
          {/* <SidebarItem 
            href="/doctor/slots/calendar" 
            icon={<Calendar size={20} />} 
            label="Slot Calendar" 
            collapsed={collapsed} 
            active={location.pathname === "/doctor/slots/calendar"}
            onClick={(e) => handleRestrictedNavigation(e, "/doctor/slots/calendar")}
          />
          <SidebarItem 
            href="/doctor/slots/emergency" 
            icon={<AlertCircle size={20} />}
            label="Emergency Block" 
            collapsed={collapsed} 
            active={location.pathname === "/doctor/slots/emergency"}
            onClick={(e) => handleRestrictedNavigation(e, "/doctor/slots/emergency")}
          /> */}
        </div>


        <SidebarItem
          href={appointmentsPath}
          icon={<Users size={20} />}
          label="Appointments"
          collapsed={collapsed}
          active={location.pathname === appointmentsPath}
          onClick={(e) => handleRestrictedNavigation(e, appointmentsPath)}
        />

        {/* Restricted Pages */}
        <SidebarItem
          href={patientPath}
          icon={<Users size={20} />}
          label="Patients"
          collapsed={collapsed}
          active={location.pathname === patientPath}
          onClick={(e) => handleRestrictedNavigation(e, patientPath)}
        />
        <SidebarItem
          href="/myChats"
          icon={<Calendar size={20} />}
          label="Conversation"
          collapsed={collapsed}
          active={location.pathname === "/myChats"}
          onClick={(e) => handleRestrictedNavigation(e, "/myChats")}
        />
        <SidebarItem
          href={review}
          icon={<Calendar size={20} />}
          label="Review"
          collapsed={collapsed}
          active={location.pathname === review}
          onClick={(e) => handleRestrictedNavigation(e, review)}
        />
      </nav>
    </div>
  );
};

export default Sidebar;
