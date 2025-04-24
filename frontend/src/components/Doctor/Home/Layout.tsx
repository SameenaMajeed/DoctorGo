import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="p-6 flex-1 ">
          <Outlet /> {/* This will load Profile Page inside Main Content */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
