import React from "react";
import { useSelector } from "react-redux";
import {useNavigate } from "react-router-dom";
import { RootState } from "../../../slice/Store/Store";
import toast from "react-hot-toast";

interface MainProps {
  onRestrictedAction?: () => void;  
}

const Main : React.FC<MainProps> = ({ onRestrictedAction }) => {

  const { doctor } = useSelector((state: RootState) => state.doctor);
  const navigate = useNavigate();

   // Function to restrict access to non-approved doctors
   const handleRestrictedNavigation = (e: React.MouseEvent, path: string) => {
    if (!doctor?.isApproved) {
      e.preventDefault(); // Prevent navigation
      toast.error("Your account is pending approval.");
      navigate("/doctor/pending-approval");
    }
  };

  console.log("Main is rendering");

  return (
    <div className="p-6 md:p-10">
      <main className="bg-white shadow-lg rounded-xl p-8 md:p-12 transition-all">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome to Your Dashboard
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Manage your <span className="text-green-600 font-semibold">appointments</span>, <span className="text-green-600 font-semibold">patients</span>, and <span className="text-green-600 font-semibold">schedule</span> efficiently.
        </p>

        {/* Quick Actions*/}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={()=>navigate('/doctor/appointments')} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition">
            View Appointments
          </button>
          {/*<button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
            Add New Patient
          </button>*/}
        </div> 
      </main>
    </div>
  );
};

export default Main;
