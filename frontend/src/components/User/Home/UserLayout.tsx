"use client"

import { NavLink, Outlet } from "react-router-dom"
import { User, Menu } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "../../../slice/Store/Store"
import Sidebar from "../SideBar"
import NotificationBell from "../../CommonComponents/NotificationBell"

const UserLayout = () => {
  const user = useSelector((state: RootState) => state.user.user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/60 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
          {/* Logo */}
          <NavLink to="/" className="flex items-center transition-all duration-300 hover:scale-105 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="DoctorGo"
                className="h-12 object-contain transition-all duration-300 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          </NavLink>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <NotificationBell />
            </div>

            {/* User Profile (Desktop) */}
            {user && (
              <div className="hidden md:flex items-center gap-4 ml-2">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/60 hover:shadow-md transition-all duration-300 group">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-blue-200 transition-all duration-300">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture || "/placeholder.svg"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="hidden lg:block overflow-hidden">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate group-hover:text-slate-600 transition-colors">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 hover:shadow-md group">
              <Menu className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Mobile User Profile */}
        {user && (
          <div className="md:hidden px-4 py-3 bg-gradient-to-r from-slate-50/80 to-blue-50/40 border-t border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden mr-4 ring-2 ring-white shadow-sm">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-blue-600" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar - Desktop - Fixed height from header to bottom */}
        <aside className="hidden md:block fixed h-[calc(100vh-5rem)] top-20 z-40">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-80 transition-all duration-300">
          <div className="p-6 sm:p-8 min-h-[calc(100vh-5rem)]">
            <div className="max-w-7xl mx-auto">
              {/* Content wrapper with subtle styling */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/80 p-6 min-h-[calc(100vh-8rem)]">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 shadow-lg z-50">
        <div className="py-3 px-4 flex justify-around">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
            {/* Add your mobile navigation icons here */}
            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLayout


// import { NavLink, Outlet } from "react-router-dom";
// import { User } from "lucide-react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../slice/Store/Store";
// import Sidebar from "../SideBar";
// import NotificationBell from "../../CommonComponents/NotificationBell"; // Assuming you have this

// const UserLayout = () => {
//   const user = useSelector((state: RootState) => state.user.user);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
//       <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
//         <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
//           {/* Logo */}
//           <NavLink
//             to="/"
//             className="flex items-center transition-transform hover:scale-105"
//           >
//             <img
//               src="/logo.png"
//               alt="DoctorGo"
//               className="h-10 object-contain"
//             />
//           </NavLink>

//           {/* Navigation Controls */}
//           <div className="flex items-center gap-4">
//             <NotificationBell />

//             {/* User Profile (Desktop) - Moved inside navigation controls */}
//             {user && (
//               <div className="hidden md:flex items-center gap-3 ml-4">
//                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
//                   {user.profilePicture ? (
//                     <img
//                       src={user.profilePicture}
//                       alt={user.name}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <User size={18} className="text-blue-600" />
//                   )}
//                 </div>
//                 <div className="hidden lg:block overflow-hidden">
//                   <p className="text-sm font-medium text-gray-900 truncate">
//                     {user.name}
//                   </p>
//                   <p className="text-xs text-gray-500 truncate">{user.email}</p>
//                 </div>
//               </div>
//             )}

//             {/* Mobile Menu Button */}
//             <button className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 6h16M4 12h16M4 18h16"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Mobile User Profile - Only shown on mobile screens */}
//         {user && (
//           <div className="md:hidden px-4 py-2 bg-gray-50 border-t border-gray-200">
//             <div className="flex items-center">
//               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
//                 {user.profilePicture ? (
//                   <img
//                     src={user.profilePicture}
//                     alt={user.name}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <User size={16} className="text-blue-600" />
//                 )}
//               </div>
//               <div className="overflow-hidden">
//                 <p className="text-sm font-medium text-gray-900 truncate">
//                   {user.name}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Main Content Area */}
//       <div className="flex flex-1 pt-16">
//         {/* Sidebar - Desktop */}
//         <aside className="hidden md:block w-64 bg-white border-r border-gray-200 fixed h-full pt-4">
//           <Sidebar />
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 md:ml-64 p-4 sm:p-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
//           <div className="max-w-7xl mx-auto">
//             <Outlet />
//           </div>
//         </main>
//       </div>

//       {/* Mobile Bottom Navigation (optional) */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around">
//         {/* Add your mobile navigation icons here */}
//       </div>
//     </div>
//   );
// };

// export default UserLayout;
