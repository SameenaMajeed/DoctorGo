"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import type { RootState } from "../../slice/Store/Store"
import { Navigate, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Main from "../../components/Doctor/Home/Main"
import Header from "../../components/Doctor/Home/Header"
import ApprovalBanner from "../../components/Doctor/Home/ApprovalBanner"
import Sidebar from "../../components/Doctor/Home/Sidebar"

const DashboardLayout: React.FC = () => {
  const { doctor, isAuthenticated } = useSelector((state: RootState) => state.doctor)
  const navigate = useNavigate()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/doctor/login" />
  }

  // Function to handle restricted actions
  const handleRestrictedAction = () => {
    if (!doctor?.isApproved) {
      toast.error("Your account is pending approval by the admin.")
      navigate("/doctor/pending-approval", { 
        state: { message: "Your account is pending approvalby the admin." },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      {/* Approval Status Banner */}
      <AnimatePresence>
        {!doctor?.isApproved && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative z-50"
          >
            <ApprovalBanner />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex h-screen">
        {/* Enhanced Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-shrink-0"
        >
          <Sidebar onRestrictedAction={handleRestrictedAction} />
        </motion.div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Header />
          </motion.div>

          {/* Enhanced Main Content */}
          <motion.main
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 overflow-y-auto bg-transparent"
          >
            <Main onRestrictedAction={handleRestrictedAction} />
          </motion.main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout


// import React from "react";
// import Sidebar from "../../components/Doctor/Home/Sidebar";
// import Header from "../../components/Doctor/Home/Header";
// import Main from "../../components/Doctor/Home/Main";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import { Navigate, useNavigate } from "react-router-dom";
// import ApprovalBanner from "../../components/Doctor/Home/ApprovalBanner";
// import toast from "react-hot-toast";

// const DashboardLayout = () => {
//   const { doctor, isAuthenticated } = useSelector(
//     (state: RootState) => state.doctor
//   );
//   const navigate = useNavigate();

//   // Redirect if not authenticated
//   if (!isAuthenticated) {
//     return <Navigate to="/doctor/login" />;
//   }

//   // Function to handle restricted actions
//   const handleRestrictedAction = () => {
//     if (!doctor?.isApproved) {
//       toast.error("Your account is pending approval by the admin.");
//       navigate("/doctor/pending-approval", {
//         state: { message: "Your account is pending approval by the admin." },
//       });
//     }
//   };

//   console.log("DashboardLayout is rendering");

//   return (
//     <div>
//       {/* Show Approval Status Banner if not approved */}
//       {!doctor?.isApproved && <ApprovalBanner />}

//       <div className="flex flex-col md:flex-row h-screen">
//         {/* Sidebar */}
//         <div className="h-20 md:h-full md:w-64 overflow-y-auto">
//           <Sidebar onRestrictedAction={handleRestrictedAction} />
//         </div>

//         {/* Main Content */}
//         <div className="flex flex-col flex-1 overflow-hidden">
//           <Header />
//           <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
//             <Main onRestrictedAction={handleRestrictedAction} />
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;
