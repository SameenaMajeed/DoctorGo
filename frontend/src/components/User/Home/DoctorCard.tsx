import React from "react";
import { motion } from "framer-motion";
import { IDoctor } from "../../../Types";

const DoctorCard = React.memo(
  ({
    item,
    handleAppointment,
  }: {
    item: IDoctor;
    handleAppointment: (id: string) => void;
  }) => (
    <motion.div
      role="region"
      aria-label={`Doctor card for Dr. ${item.name}, ${item.specialization}`}
      className="relative bg-white/95 backdrop-blur-md border border-gray-200/80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 group overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Doctor Image with gradient overlay */}
      <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
        <img
          src={item.profilePicture || "/profile.png"}
          alt={`Profile picture of Dr. ${item.name}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Doctor Info */}
      <div className="mt-5 text-left space-y-1.5">
        {/* Availability badge */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              item.isOnline ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <p
            className={`text-xs font-medium tracking-wide uppercase ${
              item.isOnline ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {item.isOnline ? "Available Today" : "Not Available Today"}
          </p>
        </div>

        {/* Name and specialization */}
        <h3 className="text-xl font-bold text-gray-900 mt-1.5 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-blue-600 text-sm font-medium">
          {item.specialization}
        </p>

        {/* Rating and experience */}
        <div className="flex items-center justify-between pt-2">
          {item.averageRating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(item.averageRating)
                        ? "text-amber-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118l-3.39-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({item.averageRating.toFixed(1)})
              </span>
            </div>
          )}

          {item.experience && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {item.experience}+ years
            </span>
          )}
        </div>
      </div>

      {/* Book Now Button */}
      <motion.button
        onClick={() => handleAppointment(item._id)}
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2"
        aria-label={`Book appointment with Dr. ${item.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Book Appointment
      </motion.button>
    </motion.div>
  )
);

export default DoctorCard;
