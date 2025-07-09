"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { AlertTriangle, Shield, Clock, X } from "lucide-react"
import type { RootState } from "../../../slice/Store/Store"
import { useState } from "react"

const ApprovalBanner: React.FC = () => {
  const { doctor } = useSelector((state: RootState) => state.doctor)
  const [isVisible, setIsVisible] = useState(true)

  if (!doctor || doctor.isApproved || !isVisible) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="relative bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-l-4 border-yellow-400 shadow-lg"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-bold text-yellow-800">Account Pending Approval</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-2">
              Your account is currently under review by our administrative team. You'll have limited access until
              verification is complete.
            </p>
            <div className="flex items-center gap-4 text-xs text-yellow-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Typical review time: 24-48 hours</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span>Status: Under Review</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-2 hover:bg-yellow-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-yellow-600" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-200">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "60%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
        />
      </div>
    </motion.div>
  )
}

export default ApprovalBanner



// import React from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../slice/Store/Store";


// const ApprovalBanner: React.FC = () => {
//   const { doctor } = useSelector((state: RootState) => state.doctor);

//   console.log('Approved : ',doctor?.isApproved)
//   console.log("Doctor object:", doctor);

//   if (!doctor || doctor.isApproved) {
//     return null; // No banner if the doctor is approved
//   }

//   return (
//     <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
//       <div className="flex">
//         <div className="flex-shrink-0">
//           <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//           </svg>
//         </div>
//         <div className="ml-3">
//           <p className="text-sm text-yellow-700">
//             Your account is pending approval. You'll have limited access until an administrator verifies your credentials.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApprovalBanner;

