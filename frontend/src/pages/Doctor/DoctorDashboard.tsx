import React from "react";
import Sidebar from "../../components/Doctor/Home/Sidebar";
import Header from "../../components/Doctor/Home/Header";
import Main from "../../components/Doctor/Home/Main";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Main/>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
