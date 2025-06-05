import { NavLink, Outlet } from "react-router-dom";
import { User } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../slice/Store/Store";
import Sidebar from "../SideBar";
import NotificationBell from "../../CommonComponents/NotificationBell"; // Assuming you have this

const UserLayout = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center transition-transform hover:scale-105"
          >
            <img
              src="/logo.png"
              alt="DoctorGo"
              className="h-10 object-contain"
            />
          </NavLink>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            {/* User Profile (Desktop) - Moved inside navigation controls */}
            {user && (
              <div className="hidden md:flex items-center gap-3 ml-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-blue-600" />
                  )}
                </div>
                <div className="hidden lg:block overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile User Profile - Only shown on mobile screens */}
        {user && (
          <div className="md:hidden px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-blue-600" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 fixed h-full pt-4">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 sm:p-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (optional) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around">
        {/* Add your mobile navigation icons here */}
      </div>
    </div>
  );
};

export default UserLayout;
