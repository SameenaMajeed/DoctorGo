import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from '../../../assets/assets';


const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-r from-cyan-500 to-blue-800 rounded-2xl p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between max-w-screen-xl mx-auto shadow-2xl overflow-hidden">
      {/* Left Side - Text & Button */}
      <div className="text-left max-w-lg text-white">
        <p className="text-lg md:text-xl font-medium opacity-90">
          World-class care for everyone. Our health system offers unmatched, expert health care. From the lab to the clinic.
        </p>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mt-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-2xl">
          Book Appointment
        </h1>
        <p className="text-lg md:text-xl mt-4 font-medium opacity-90">
          With 100+ Trusted Doctors
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="mt-6 px-8 py-4 bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold rounded-full shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none border-2 border-transparent hover:border-white"
        >
          Create Account
        </button>
      </div>

      {/* Right Side - Doctor's Image with Stunning Effects */}
      <div className="relative w-full lg:w-auto flex justify-end lg:self-end">
        <img
          src={assets.appointment_img}
          alt="Doctor"
          className="max-w-[380px] lg:max-w-[340px] object-contain drop-shadow-2xl rounded-xl border-4 border-white shadow-xl transition-transform duration-500 hover:scale-110 hover:rotate-3 hover:shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Banner;
