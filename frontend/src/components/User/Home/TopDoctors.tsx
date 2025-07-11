import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../../axios/UserInstance";
import { IDoctor } from "../../../Types";
import DoctorCard from "./DoctorCard";

const TopDoctors: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isHoveringMore, setIsHoveringMore] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get<{
          data: IDoctor[];
          message: string;
          success: boolean;
        }>("/doctors");
        console.log("response", response.data.data);
        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          setMessage(response.data.message || "Failed to fetch doctors.");
        }
      } catch (error) {
        setMessage("Error fetching doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleAppointment = async (doctorId: string) => {
    try {
      navigate(`/doctors/${doctorId}`);
    } catch (error) {
      setMessage("Doctor appointment failed");
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.specialization.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80 min-h-screen py-12 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Our <span className="text-blue-600">Trusted</span> Medical
            Specialists
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Connect with highly qualified doctors dedicated to your health and
            wellness.
          </motion.p>

          {/* Search/Filter Input */}
          <motion.div
            className="mt-8 max-w-md mx-auto relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search by specialty (e.g. Cardiologist)"
                className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 shadow-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <svg
                className="absolute right-4 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Doctors Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {loading ? (
            // Enhanced loading state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading top doctors...</p>
            </div>
          ) : message ? (
            // Error message with better styling
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-600 text-lg font-medium">{message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredDoctors.length > 0 ? (
            [...filteredDoctors]
              .sort((a, b) => {
                const aRating = a.averageRating ?? 0;
                const bRating = b.averageRating ?? 0;
                const aExp = a.experience ?? 0;
                const bExp = b.experience ?? 0;

                if (bRating !== aRating) return bRating - aRating;
                return bExp - aExp;
              })
              .slice(0, 5)
              .map((item, index) => (
                // filteredDoctors.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  whileHover={{ y: -5 }}
                >
                  <DoctorCard
                    item={item}
                    handleAppointment={handleAppointment}
                  />
                </motion.div>
              ))
          ) : (
            // No results state
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't find any doctors matching "{filter}". Try another
                specialty or check back later.
              </p>
              <button
                onClick={() => setFilter("")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </motion.div>

        {/* Load More Button */}
        {!loading && !message && filteredDoctors.length > 0 && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => {
                navigate("/doctorsList");
                scrollTo(0, 0);
              }}
              onHoverStart={() => setIsHoveringMore(true)}
              onHoverEnd={() => setIsHoveringMore(false)}
              aria-label="View all doctors"
              className="relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              <motion.span
                className="relative z-10 flex items-center gap-2"
                animate={{ x: isHoveringMore ? 5 : 0 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                View All Doctors
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: isHoveringMore ? 8 : 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </motion.svg>
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0"
                animate={{ opacity: isHoveringMore ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TopDoctors;
