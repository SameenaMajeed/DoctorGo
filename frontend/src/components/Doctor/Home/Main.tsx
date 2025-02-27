import React from "react";

const Main = () => {
  return (
    <div className="p-6 md:p-10">
      <main className="bg-white shadow-lg rounded-xl p-8 md:p-12 transition-all">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome to Your Dashboard
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Manage your <span className="text-green-600 font-semibold">appointments</span>, <span className="text-green-600 font-semibold">patients</span>, and <span className="text-green-600 font-semibold">schedule</span> efficiently.
        </p>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
            View Appointments
          </button>
          <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
            Add New Patient
          </button>
        </div>
      </main>
    </div>
  );
};

export default Main;
