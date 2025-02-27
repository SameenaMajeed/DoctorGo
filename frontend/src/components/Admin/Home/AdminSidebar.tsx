import React from "react";
import {
  Home,
  Users,
  Stethoscope,
  CalendarCheck,
  CheckCircle,
  BarChart,
  CreditCard,
  FileText,
  LogOut,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import { useNavigate } from "react-router-dom";
import adminApi from "../../../axios/AdminInstance";

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await adminApi.post("/logout", {
        method: "POST",
        credentials: "include", // Ensures cookies are included in the request
      });

      if (response) {
        navigate("/admin"); // Redirect to login after successful logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-5 flex flex-col border-r border-gray-200">
      {/* Logo Section */}
      <div className="mb-6 flex justify-center">
        <img src="/logo.png" alt="DoctorGo" className="h-20" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        <SidebarItem
          href="/admin/dashboard"
          icon={<Home size={20} />}
          label="Dashboard"
        />
        <SidebarItem
          href="/admin/users"
          icon={<Users size={20} />}
          label="Users"
        />
        <SidebarItem
          href="/admin/doctors"
          icon={<Stethoscope size={20} />}
          label="Doctors"
        />
        <SidebarItem
          href="/admin/appointments"
          icon={<CalendarCheck size={20} />}
          label="Appointments"
        />
        <SidebarItem
          href="/admin/approvals"
          icon={<CheckCircle size={20} />}
          label="Approvals"
        />
        <SidebarItem
          href="/admin/sales_report"
          icon={<BarChart size={20} />}
          label="Sales Report"
        />
        <SidebarItem
          href="/admin/payments"
          icon={<CreditCard size={20} />}
          label="Payments"
        />
        <SidebarItem
          href="/admin/reports"
          icon={<FileText size={20} />}
          label="Reports"
        />
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg w-full"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
