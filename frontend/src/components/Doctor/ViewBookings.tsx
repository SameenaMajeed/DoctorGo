import React from "react";
import Sidebar from "./Home/Sidebar";

const ViewBookings = () => {
  const patients = [
    { name: "Hugo Lloris", phone: "+1 234 567 890", gender: "Male", bloodGroup: "A+", age: 25, createdAt: "20 Aug 2021" },
    { name: "Mauris Auctor", phone: "+1 456 789 123", gender: "Female", bloodGroup: "B+", age: 34, createdAt: "22 Nov 2023" },
    { name: "Michael Owen", phone: "+1 890 123 456", gender: "Male", bloodGroup: "O+", age: 45, createdAt: "12 Jan 2020" },
    { name: "Amina Smith", phone: "+1 908 765 432", gender: "Female", bloodGroup: "AB+", age: 28, createdAt: "07 Feb 2001" },
  ];

  return (

      <div className="flex-1 p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold">Today’s Patients</h2>
            <p className="text-2xl font-bold text-blue-600">10</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold">Monthly Patients</h2>
            <p className="text-2xl font-bold text-green-600">230</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold">Yearly Patients</h2>
            <p className="text-2xl font-bold text-red-600">1,500</p>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Patients</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 border">Patient</th>
                  <th className="p-3 border">Created At</th>
                  <th className="p-3 border">Gender</th>
                  <th className="p-3 border">Blood Group</th>
                  <th className="p-3 border">Age</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr key={index} className="text-center hover:bg-gray-100 transition">
                    <td className="p-3 border">{patient.name}</td>
                    <td className="p-3 border">{patient.createdAt}</td>
                    <td className="p-3 border">
                      <span className={`px-2 py-1 rounded-full text-white ${patient.gender === "Male" ? "bg-blue-500" : "bg-pink-500"}`}>
                        {patient.gender}
                      </span>
                    </td>
                    <td className="p-3 border">{patient.bloodGroup}</td>
                    <td className="p-3 border">{patient.age}</td>
                    <td className="p-3 border">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default ViewBookings;
