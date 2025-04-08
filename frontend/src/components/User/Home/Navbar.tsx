import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { assets } from "../../../assets/assets";
import { RootState } from "../../../slice/Store/Store";
import { logoutUser } from "../../../slice/user/userSlice";
import api from "../../../axios/UserInstance";
import { useDispatch, useSelector } from "react-redux";

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  console.log('User details :' , user)
  console.log('User details :' , user?.email)

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      dispatch(logoutUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-400 py-2 px-6 fixed w-full top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center">
          <img
            src='logo.png'
            alt="Logo"
            className="w-24 transition-transform duration-300 hover:scale-105"
          />
        </NavLink>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Navigation Links */}
        <ul
          className={`${
            showMenu ? "block" : "hidden"
          } md:flex absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none py-5 md:py-0 transition-all duration-300`}
        >
          {[
            { path: "/", label: "HOME" },
            { path: "/doctors", label: "ALL DOCTORS" },
            { path: "/about", label: "ABOUT" },
            { path: "/contact", label: "CONTACT" },
          ].map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block py-2 px-6 md:px-3 transition-all duration-300 rounded-lg hover:bg-gray-100 md:hover:bg-transparent ${
                  isActive ? "text-primary font-bold md:bg-gray-200" : "hover:text-primary"
                }`
              }
              onClick={() => setShowMenu(false)} // Close menu on click (mobile)
            >
              <li className="list-none">{link.label}</li>
            </NavLink>
          ))}
        </ul>

        {/* Account Section */}
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img className="w-8 rounded-full" src={assets.profile_pic} alt="Profile" />
              <span className="text-sm">Hello, {user.name}</span>
              <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />

              {/* Dropdown Menu */}
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("/my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("/my-aappointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={() => navigate("/my-conversation")}
                    className="hover:text-black cursor-pointer"
                  >
                    Conversation
                  </p>
                  <p onClick={handleLogout} className="hover:text-black cursor-pointer">
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLink
                to="/signup"
                className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
              >
                Register
              </NavLink>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
