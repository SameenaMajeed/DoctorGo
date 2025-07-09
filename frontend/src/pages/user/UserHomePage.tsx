// import React from 'react'
// import Header from '../../components/User/Home/Header'
// import SpecialityMenu from '../../components/User/Home/SpecialityMenu'
// import TopDoctors from '../../components/User/Home/TopDoctors'
// import Banner from '../../components/User/Home/Banner'
// import Navbar from '../../components/User/Home/Navbar'
// import Footer from '../../components/User/Home/Footer'

// const UserHomePage : React.FC = () => {
//   return (
//     <div>
//       <Navbar/>
//       <Header/>
//       <SpecialityMenu/>
//       <TopDoctors/>
//       <Banner/>
//       <Footer/>
//     </div>
//   )
// }

// export default UserHomePage


"use client"

import type React from "react"
import { motion } from "framer-motion"
import Header from '../../components/User/Home/Header'
import SpecialityMenu from '../../components/User/Home/SpecialityMenu'
import TopDoctors from '../../components/User/Home/TopDoctors'
import Banner from '../../components/User/Home/Banner'
import Navbar from '../../components/User/Home/Navbar'
import Footer from '../../components/User/Home/Footer'


const UserHomePage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50"
    >
      <Navbar />
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
      <Footer />
    </motion.div>
  )
}

export default UserHomePage
