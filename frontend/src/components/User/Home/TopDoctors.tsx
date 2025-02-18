import React from "react";
import { assets, doctors } from '../../../assets/assets';

import { useNavigate } from "react-router-dom";

const TopDoctors = () => {

    const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-12">
      <div className="max-w-screen-xl mx-auto px-8 lg:px-16 text-center">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-800">Top Doctors to Book</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Simply browse through our extensive list of trusted doctors.
        </p>

        {/* Doctors Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {doctors.slice(0, 10).map((item, index) => (
            <div onClick={()=>navigate(`/appoinment/${item._id}`)}
              key={index}
              className="bg-white/70 backdrop-blur-lg border border-gray-200 p-5 rounded-2xl shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-56 object-cover rounded-xl"
              />
              <div className="mt-4 text-left">
                {/* Availability Badge */}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-green-600 text-sm font-semibold">Available</p>
                </div>
                {/* Doctor Name */}
                <p className="text-xl font-semibold text-gray-800 mt-1">
                  {item.name}
                </p>
                {/* Specialty */}
                <p className="text-gray-500 text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>

        {/* More Button */}
        <button onClick = {()=>{navigate('/doctors') ; scrollTo(0,0)}} className="mt-12 px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
          Load More
        </button>
      </div>
    </div>
  );
};

export default TopDoctors;
