"use client"

import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import Sidebar from "./Sidebar"
import Header from "./Header"

const Layout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10" />
      
      {/* Sidebar with enhanced styling */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10"
      >
        <Sidebar />
      </motion.div>

      {/* Main Content Area with enhanced design */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header with enhanced styling */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <Header />
        </motion.div>

        {/* Enhanced Page Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="flex-1 relative overflow-hidden"
        >
          {/* Content Background with Glass Effect */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border-t border-white/20" />
          
          {/* Scrollable Content Area */}
          <div className="relative z-10 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <div className="p-6 min-h-full">
              {/* Content Wrapper with Enhanced Styling */}
              <div className="max-w-full mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="relative"
                >
                  <Outlet />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Layout



// import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import Header from "./Header";

// const Layout = () => {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <Header />

//         {/* Page Content */}
//         <div className="p-6 flex-1">
//           <Outlet /> 
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;
