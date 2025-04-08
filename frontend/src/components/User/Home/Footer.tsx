import React from 'react';
import { assets } from '../../../assets/assets';


const Footer = () => {
  return (
    <footer className="w-full bg-white mt-20 p-8 text-gray-700">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* Brand Info */}
          <div>
          <img
            src='logo.png'
            alt="Logo"
            className="w-28 transition-transform duration-300 hover:scale-105"
          />
            <p className="mt-2 text-gray-600 text-sm">
              Your trusted healthcare partner. Connecting you to the best doctors.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg">Company</h4>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm">
              <li className="hover:text-blue-500 cursor-pointer">Home</li>
              <li className="hover:text-blue-500 cursor-pointer">About Us</li>
              <li className="hover:text-blue-500 cursor-pointer">Contact Us</li>
              <li className="hover:text-blue-500 cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg">Get in Touch</h4>
            <p className="mt-2 text-gray-600 text-sm">📞 +1-212-456-7890</p>
            <p className="text-gray-600 text-sm">✉️ support@doctorgo.com</p>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-400 pt-6 text-center text-gray-600 text-sm">
        <p>Copyright © 2025 DoctorGo - All Rights Reserved.</p>
      </div>
      </footer>
  );
};

export default Footer;