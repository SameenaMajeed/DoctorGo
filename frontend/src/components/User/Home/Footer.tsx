import React from 'react';
import { assets } from '../../../assets/assets';


const Footer = () => {
  return (
    <footer className="bg-white text-gray-900 py-10 mt-10 mx-6 shadow-lg rounded-lg">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="space-y-4">
          <img src={assets.logo} alt="DoctorGo Logo" className="h-12" />
          <p className="text-gray-700 text-sm">
            Book your doctor’s appointment effortlessly with our seamless online platform.
            Find trusted healthcare professionals, schedule visits at your convenience, and get the care you need—anytime, anywhere. 
            Your health, your schedule!
          </p>
        </div>

        {/* Center Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">COMPANY</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="hover:text-gray-900 transition cursor-pointer">Home</li>
            <li className="hover:text-gray-900 transition cursor-pointer">About Us</li>
            <li className="hover:text-gray-900 transition cursor-pointer">Contact Us</li>
            <li className="hover:text-gray-900 transition cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">GET IN TOUCH</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="hover:text-gray-900 transition cursor-pointer">+1-212-456-7890</li>
            <li className="hover:text-gray-900 transition cursor-pointer">doctorgo107@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-10 border-t border-gray-400 pt-6 text-center text-gray-600 text-sm">
        <p>Copyright © 2025 DoctorGo - All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;