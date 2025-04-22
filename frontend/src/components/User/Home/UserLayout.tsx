import { NavLink, Outlet } from "react-router-dom";
import Sidebar from "../SideBar";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <NavLink to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="DoctorGo"
              className="w-24 transition-transform duration-300 hover:scale-105"
            />
          </NavLink>
        </div>
      </header>

      <div className="flex flex-1 pt-20">
      <aside className="hidden md:block w-64 bg-white border-r">
          <Sidebar />
  
        </aside>
        <div className="p-6 flex-1">
          <Outlet /> {/* This will load Profile Page inside Main Content */}
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
