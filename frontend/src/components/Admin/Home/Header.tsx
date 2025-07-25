import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch} from "react-redux";
import toast from "react-hot-toast";
// import adminApi from "../../../axios/AdminInstance";
import { adminLogout } from "../../../slice/admin/adminSlice";
import { createApiInstance } from "../../../axios/apiService";

const adminApi = createApiInstance("admin");

const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await adminApi.post("/logout");
      dispatch(adminLogout());
      toast.success(" Logged Out!, You have been successfully logged out.");
      navigate("/admin");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg relative z-40"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients, appointments, or records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative z-50" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="relative">
                <img
                  src={"/profile.png"}
                  alt={"Admin Profile"}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-lg"
                />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden z-[9999]"
                  style={{ zIndex: 9999 }}
                >
                  {/* Menu Items */}
                  <div className="p-2">
                    {/* Divider */}

                    {/* Logout */}
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 rounded-xl transition-colors group text-left"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-red-600 group-hover:text-red-700">
                        Logout
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
