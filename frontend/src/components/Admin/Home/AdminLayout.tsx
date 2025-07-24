import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const Layout = () => {
  return (
<div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <AdminSidebar/>
        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet /> 
        </div>
    </div>
  );
};

export default Layout;
