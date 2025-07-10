"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { FiMenu, FiX } from "react-icons/fi"
import { assets } from "../../../assets/assets"
import type { RootState } from "../../../slice/Store/Store"
import { logoutUser } from "../../../slice/user/userSlice"
import api from "../../../axios/UserInstance"
import { useDispatch, useSelector } from "react-redux"
import { User } from "lucide-react"
import NotificationBell from "../../CommonComponents/NotificationBell"
import { motion, AnimatePresence } from "framer-motion"

const Navbar: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user.user)
  const [showMenu, setShowMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await api.post("/logout")
      dispatch(logoutUser())
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  }

  return (
    <motion.nav
      className={`bg-white shadow-md border-b border-gray-200 py-2 px-6 fixed w-full top-0 z-50 ${
        isScrolled ? "shadow-lg" : "shadow-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo with animation */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <NavLink to="/" className="flex items-center">
            <img src="/logo.png" alt="Logo" className="w-24 transition-transform duration-300 hover:scale-105" />
          </NavLink>
        </motion.div>

        {/* Mobile Menu Toggle */}
        <motion.button
          className="md:hidden text-gray-800 p-2 rounded-full hover:bg-gray-100"
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>

        {/* Navigation Links */}
        <AnimatePresence>
          {(showMenu || !window.matchMedia("(max-width: 768px)").matches) && (
            <motion.ul
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${
                showMenu ? "block" : "hidden"
              } md:flex absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none py-5 md:py-0`}
            >
              {[
                { path: "/", label: "HOME" },
                { path: "/doctorsList", label: "ALL DOCTORS" },
                { path: "/about", label: "ABOUT" },
                { path: "/contact", label: "CONTACT" },
              ].map((link) => (
                <motion.li key={link.path} variants={menuItemVariants} className="list-none">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `block py-2 px-6 md:px-4 transition-all duration-300 rounded-lg hover:bg-gray-100 md:hover:bg-transparent ${
                        isActive ? "text-primary font-bold md:bg-gray-100" : "hover:text-primary"
                      }`
                    }
                    onClick={() => setShowMenu(false)}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {link.label}
                    </motion.div>
                  </NavLink>
                </motion.li>
              ))}

              {/* Mobile Account Section */}
              <motion.li variants={menuItemVariants} className="list-none md:hidden">
                {user ? (
                  <div className="px-6 py-2">
                    {/* Mobile User Info */}
                    <div className="flex items-center gap-3 py-3 border-t border-gray-200">
                      {user.profilePicture ? (
                        <motion.img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ) : (
                        <motion.div
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <User size={20} className="text-blue-600" />
                        </motion.div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Hello, {user.name}</p>
                      </div>
                      <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <NotificationBell />
                      </motion.div>
                    </div>

                    {/* Mobile Menu Items */}
                    <div className="space-y-1">
                      {[
                        { label: "My Profile", path: "/my-profile" },
                        { label: "My Appointments", path: "/my-appointments" },
                        { label: "Conversation", path: "/my-chats" },
                        { label: "Wallet", path: "/wallet" },
                        { label: "Logout", action: handleLogout },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="block py-2 px-3 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                          onClick={() => {
                            if (item.action) {
                              item.action()
                            } else {
                              navigate(item.path!)
                            }
                            setShowMenu(false)
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.label}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <NavLink
                        to="/signup"
                        className="block text-center text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-white py-2 px-4 rounded-full transition-colors border border-[#8b5d3b]"
                        onClick={() => setShowMenu(false)}
                      >
                        Register
                      </NavLink>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button
                        onClick={() => {
                          navigate("/login")
                          setShowMenu(false)
                        }}
                        className="w-full text-sm bg-[#8b5d3b] text-white hover:bg-[#6d4a2f] py-2 px-4 rounded-full transition-colors shadow-md"
                      >
                        Login
                      </button>
                    </motion.div>
                  </div>
                )}
              </motion.li>
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Desktop Account Section */}
        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <NotificationBell />
              </motion.div>

              <div className="flex items-center gap-2 cursor-pointer group relative">
                {user.profilePicture ? (
                  <motion.img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ) : (
                  <motion.div
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User size={16} className="text-blue-600" />
                  </motion.div>
                )}
                <span className="text-sm font-medium">Hello, {user.name}</span>
                <motion.img
                  className="w-2.5"
                  src={assets.dropdown_icon}
                  alt="Dropdown"
                  animate={{ rotate: showMenu ? 180 : 0 }}
                />
                {/* Dropdown Menu */}
                <AnimatePresence>
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block"
                  >
                    <div className="min-w-48 bg-white rounded-lg shadow-xl flex flex-col gap-2 p-3 border border-gray-100">
                      {[
                        { label: "My Profile", path: "/my-profile" },
                        { label: "My Appointments", path: "/my-appointments" },
                        { label: "Conversation", path: "/my-chats" },
                        { label: "Wallet", path: "/wallet" },
                        { label: "Logout", action: handleLogout },
                      ].map((item, index) => (
                        <motion.p
                          key={index}
                          className="hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer transition-colors"
                          onClick={() => {
                            if (item.action) {
                              item.action()
                            } else {
                              navigate(item.path!)
                            }
                            setShowMenu(false)
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.label}
                        </motion.p>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink
                  to="/signup"
                  className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-white py-2 px-4 rounded-full transition-colors border border-[#8b5d3b]"
                >
                  Register
                </NavLink>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm bg-[#8b5d3b] text-white hover:bg-[#6d4a2f] py-2 px-4 rounded-full transition-colors shadow-md"
                >
                  Login
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar



// import React, { useEffect, useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { FiMenu, FiX } from "react-icons/fi";
// import { assets } from "../../../assets/assets";
// import { RootState } from "../../../slice/Store/Store";
// import { logoutUser } from "../../../slice/user/userSlice";
// import api from "../../../axios/UserInstance";
// import { useDispatch, useSelector } from "react-redux";
// import { User, WalletIcon } from "lucide-react";
// import NotificationBell from "../../CommonComponents/NotificationBell";

// const Navbar: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const user = useSelector((state: RootState) => state.user.user);
//   const [walletBalance, setWalletBalance] = useState<number>(0);
//   const [showMenu, setShowMenu] = useState(false);

//   const handleLogout = async () => {
//     try {
//       await api.post("/logout");
//       dispatch(logoutUser());
//       navigate("/login");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   return (
//     <nav className="bg-white shadow-md border-b border-gray-400 py-2 px-6 fixed w-full top-0 z-50">
//       <div className="container mx-auto flex items-center justify-between">
//         {/* Logo */}
//         <NavLink to="/" className="flex items-center">
//           <img
//             src="logo.png"
//             alt="Logo"
//             className="w-24 transition-transform duration-300 hover:scale-105"
//           />
//         </NavLink>

//         {/* Mobile Menu Toggle */}
//         <button
//           className="md:hidden text-gray-800"
//           onClick={() => setShowMenu(!showMenu)}
//         >
//           {showMenu ? <FiX size={24} /> : <FiMenu size={24} />}
//         </button>

//         {/* Navigation Links */}
//         <ul
//           className={`${
//             showMenu ? "block" : "hidden"
//           } md:flex absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none py-5 md:py-0 transition-all duration-300`}
//         >
//           {[
//             { path: "/", label: "HOME" },
//             { path: "/doctorsList", label: "ALL DOCTORS" },
//             { path: "/about", label: "ABOUT" },
//             { path: "/contact", label: "CONTACT" },
//           ].map((link) => (
//             <NavLink
//               key={link.path}
//               to={link.path}
//               className={({ isActive }) =>
//                 `block py-2 px-6 md:px-3 transition-all duration-300 rounded-lg hover:bg-gray-100 md:hover:bg-transparent ${
//                   isActive
//                     ? "text-primary font-bold md:bg-gray-200"
//                     : "hover:text-primary"
//                 }`
//               }
//               onClick={() => setShowMenu(false)} // Close menu on click (mobile)
//             >
//               <li className="list-none">{link.label}</li>
//             </NavLink>
//           ))}
//         </ul>

//         {/* Account Section */}
//         <div className="hidden md:block">
//           {user ? (
//             <div className="flex items-center space-x-6">
//               {/* Notifications */}
//               <div className="relative">
//                 <NotificationBell />
//               </div>
//               <div className="flex items-center gap-2 cursor-pointer group relative">
//                 {user.profilePicture ? (
//                   <img
//                     src={user.profilePicture}
//                     alt={user.name}
//                     className="w-8 rounded-full"
//                   />
//                 ) : (
//                   <User size={16} className="text-blue-600" />
//                 )}
//                 {/* <img className="w-8 rounded-full" src={user.profilePicture} alt={user.name} /> */}
//                 <span className="text-sm">Hello, {user.name}</span>
//                 <img
//                   className="w-2.5"
//                   src={assets.dropdown_icon}
//                   alt="Dropdown"
//                 />

//                 {/* Dropdown Menu */}
//                 <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
//                   <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
//                     <p
//                       onClick={() => navigate("/my-profile")}
//                       className="hover:text-black cursor-pointer"
//                     >
//                       My Profile
//                     </p>
//                     <p
//                       onClick={() => navigate("/my-appointments")}
//                       className="hover:text-black cursor-pointer"
//                     >
//                       My Appointments
//                     </p>
//                     <p
//                       onClick={() => navigate("/my-chats")}
//                       className="hover:text-black cursor-pointer"
//                     >
//                       Conversation
//                     </p>
//                     <p
//                       onClick={() => navigate("/wallet")}
//                       className="hover:text-black cursor-pointer"
//                     >
//                       Wallet
//                     </p>
//                     <p
//                       onClick={handleLogout}
//                       className="hover:text-black cursor-pointer"
//                     >
//                       Logout
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="flex items-center space-x-4">
//               <NavLink
//                 to="/signup"
//                 className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
//               >
//                 Register
//               </NavLink>
//               <button
//                 onClick={() => navigate("/login")}
//                 className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
//               >
//                 Login
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
