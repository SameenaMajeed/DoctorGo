import React from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/CommonComponents/Footer";

const AdminLanding: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center px-10">
        <img
          src="/logo.png"
          alt="DoctorGo"
          className="w-24 transition-transform duration-300 hover:scale-105"
        />
        <button
          onClick={() => navigate("/admin/login")}
          className="px-5 py-2 rounded-full bg-white/30 backdrop-blur-md border border-blue-500 text-blue-600 font-semibold hover:bg-blue-500 hover:text-white transition"
        >
          Admin Login ➝
        </button>
      </nav>

      {/* Hero Section */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center mt-16 md:mt-24 px-6 md:px-20">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h2 className="text-5xl font-bold text-gray-900 leading-snug">
            Book Appointments <br />
            With Trusted <span className="text-blue-600">Doctors</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Get the best healthcare with our certified doctors. Easy, fast, and
            reliable.
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="px-6 py-3 text-lg font-semibold bg-white border border-blue-500 text-blue-600 rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-all"
          >
            LOGIN
          </button>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
          <img
            src={assets.header_img}
            alt="Doctors"
            className="w-80 md:w-[450px] rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
          />
        </div>
      </div>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default AdminLanding;
