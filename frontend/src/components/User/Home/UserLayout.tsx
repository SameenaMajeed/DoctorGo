import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "../SideBar";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navbar />
      </div>

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
