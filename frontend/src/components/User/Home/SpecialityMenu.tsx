// import React from 'react';
// import { specialityData } from '../../../assets/assets';
// import { Link } from 'react-router-dom';

// const SpecialityMenu : React.FC = () => {
//   return (
//     <div id='speciality' className='py-12 px-4 bg-white text-center'>
//       <h1 className='text-3xl font-bold text-gray-900 mb-4'>Find by Speciality</h1>
//       <p className='text-gray-600 text-base mb-8'>
//         Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
//       </p>
//       <div className='flex justify-center gap-8 flex-wrap'>
//         {specialityData.map((item, index) => (
//           <Link onClick={()=>scrollTo(0,0)}
//             key={index}
//             to={`/doctors/${item.speciality}`}
//             className='flex flex-col items-center text-center group'
//           >
//             <div className='w-24 h-24 rounded-full border-2 border-transparent group-hover:border-blue-500 transition-transform transform group-hover:scale-110 p-2'>
//               <img
//                 src={item.image}
//                 alt={item.speciality}
//                 className='w-full h-full object-cover rounded-full'
//               />
//             </div>
//             <p className='text-sm font-medium text-gray-700 mt-2 group-hover:text-blue-500 transition-colors'>
//               {item.speciality}
//             </p>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SpecialityMenu;

"use client";

import type React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { specialityData } from "../../../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu: React.FC = () => {
  // const specialities = [
  //   {
  //     name: "General Physician",
  //     image: "./General_physician.svg",
  //     color: "from-blue-400 to-blue-600",
  //   },
  //   {
  //     name: "Gynecologist",
  //     image: "./Gastroenterologist.svg",
  //     color: "from-pink-400 to-pink-600",
  //   },
  //   {
  //     name: "Dermatologist",
  //     image: "/placeholder.svg?height=80&width=80",
  //     color: "from-green-400 to-green-600",
  //   },
  //   {
  //     name: "Pediatricians",
  //     image: "/placeholder.svg?height=80&width=80",
  //     color: "from-yellow-400 to-yellow-600",
  //   },
  //   {
  //     name: "Neurologist",
  //     image: "/placeholder.svg?height=80&width=80",
  //     color: "from-purple-400 to-purple-600",
  //   },
  //   {
  //     name: "Gastroenterologist",
  //     image: "/placeholder.svg?height=80&width=80",
  //     color: "from-red-400 to-red-600",
  //   },
  // ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-20  bg-blue-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,_#000_1px,_transparent_0)] bg-[length:50px_50px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Find by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Speciality
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Simply browse through our extensive list of trusted doctors and
            schedule your appointment hassle-free.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8"
        >
          {specialityData.map((item, index) => (
             <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
              className="group cursor-pointer"
            >
            <Link
              key={index}
              to={`/doctors/${item.speciality}`}
              onClick={() => scrollTo(0, 0)}
              className="flex flex-col items-center text-center group"
            >
              <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                <img
                  src={item.image}
                  alt={item.speciality}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2 group-hover:text-blue-500 transition-colors">
                {item.speciality}
              </p>
            </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            View All Specialities
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div> */}
      </div>
    </section>
  );
};

export default SpecialityMenu;
