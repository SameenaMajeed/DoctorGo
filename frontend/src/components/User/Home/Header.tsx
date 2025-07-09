// import { assets } from "../../../assets/assets";

// const Header: React.FC = () => {
//   return (
//     <div className="mt-16 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl shadow-xl mx-6 lg:mx-10 transition-all duration-300">
//       {/* Left Side */}
//       <div className="lg:w-1/2 text-center lg:text-left space-y-6">
//         <h1 className="text-5xl font-extrabold leading-snug">
//           Book Appointments <br />
//           With <span className="text-yellow-300">Trusted Doctors</span>
//         </h1>
//         <div className="flex items-center justify-center lg:justify-start space-x-4">
//           <img
//             src={assets.group_profiles}
//             alt="Group Profiles"
//             className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
//           />
//           <p className="text-lg max-w-md leading-relaxed">
//             Find top-rated doctors & schedule your appointment <br />
//             hassle-free in just a few clicks.
//           </p>
//         </div>
//         <a
//           href="/login"
//           className="inline-flex items-center bg-white text-blue-600 px-7 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-200 transition-all duration-300"
//         >
//           Book Appointment
//           <img src={assets.arrow_icon} alt="Arrow Icon" className="ml-3 w-6" />
//         </a>
//       </div>

//       {/* Right Side */}
//       <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
//         <img
//           src={assets.header_img}
//           alt="Header Illustration"
//           className="w-full max-w-lg drop-shadow-2xl hover:scale-105 transition-all duration-300"
//         />
//       </div>
//     </div>
//   );
// };

// export default Header;


"use client"

import type React from "react"
import { motion } from "framer-motion"
import { assets } from "../../../assets/assets"

const Header: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="mt-16 relative overflow-hidden bg-blue-100"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-12 lg:py-20 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl shadow-xl mx-6 lg:mx-10 transition-all duration-300">
        {/* Left Side */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:w-1/2 text-center lg:text-left space-y-6 lg:space-y-8"
        >
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-snug">
            Book Appointments <br />
            With{" "}
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-[length:200%_100%] bg-clip-text text-transparent"
            >
              Trusted Doctors
            </motion.span>
          </motion.h1>

          <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start space-x-4">
            <motion.img
              whileHover={{ scale: 1.1, rotate: 5 }}
              src={assets.group_profiles}
              alt="Group Profiles"
              className="w-14 h-14 rounded-full shadow-lg transition-all duration-300"
            />
            <p className="text-lg max-w-md leading-relaxed">
              Find top-rated doctors & schedule your appointment <br />
              hassle-free in just a few clicks.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center bg-white text-blue-600 px-7 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Book Appointment
              <motion.img
                src={assets.arrow_icon}
                alt="Arrow Icon"
                className="ml-3 w-6 transition-transform group-hover:translate-x-1"
              />
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 lg:gap-8 pt-6">
            {[
              { number: "1000+", label: "Expert Doctors" },
              { number: "50+", label: "Specialties" },
              { number: "24/7", label: "Support" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="text-2xl lg:text-3xl font-bold text-yellow-300">{stat.number}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center relative"
        >
          <motion.div variants={floatingVariants} animate="animate">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl transform rotate-6"></div>
            <img
              src={assets.header_img || "/placeholder.svg"}
              alt="Header Illustration"
              className="relative w-full max-w-lg drop-shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl"
            />
          </motion.div>

          
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Header
