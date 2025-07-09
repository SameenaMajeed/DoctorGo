import React, { useState, useEffect, useCallback } from "react";
import adminApi from "../../axios/AdminInstance";
import { RefreshCw, Sun, Moon } from "lucide-react";
import AdminSidebar from "../../components/Admin/Home/AdminSidebar";
import AdminProfile from "../../components/Admin/Home/AdminProfile";
import RecentBookingsTable from "./Dashboard/RecentBookingsTable";
import { IBooking, IDashboardData, IDoctor } from "../../Types";
import TopPatientsCard from "./Dashboard/TopPatientsCard";
import PendingApprovalsCard from "./Dashboard/PendingApprovalsCard";
import BookingDetailsModal from "./Dashboard/BookingDetailsModal";

type FilterType = "daily" | "monthly" | "yearly" | "custom"

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [recentBookings, setRecentBookings] = useState<IBooking[]>([]);
  const [, setDoctors] = useState<IDoctor[]>([]);
  // const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filter] = useState<FilterType>("monthly");

  const selectedDoctor: string = "";

  // const filter: "daily" | "monthly" | "yearly" | "custom" = "monthly";
  const endDate: string = "";
  const startDate: string = "";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await adminApi.get("/doctor");
        setDoctors(response.data.data.doctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (selectedDoctor) params.doctorId = selectedDoctor;
      if (filter === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (filter !== "custom") {
        params.filter = filter;
      }
      const response = await adminApi.get("/dashboard", { params });
      const dashboardData = response.data.data;
      setData(dashboardData);
      setRecentBookings(dashboardData.recentBookings || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filter, startDate, endDate, selectedDoctor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      fetchData();
    }
  };

  const handleViewBookingDetails = (booking: IBooking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg">
        No data available
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-50 text-gray-900"
      }`}
    >
      <AdminSidebar />
      <div className="ml-64 p-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div
            className={`rounded-2xl shadow-xl p-6 sm:p-8 ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Admin Dashboard
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Overview as of{" "}
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {lastUpdated && (
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Last Updated:{" "}
                    {lastUpdated.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <>
                    {isDarkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </>
                </button>
                <button
                  onClick={handleRefresh}
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "bg-gray-800 text-blue-400 hover:bg-gray-700"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  } ${isRefreshing ? "animate-spin" : ""}`}
                  disabled={isRefreshing}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <AdminProfile />
              </div>
            </div>
            <RecentBookingsTable
              bookings={recentBookings}
              onViewDetails={handleViewBookingDetails}
              isDarkMode={isDarkMode}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TopPatientsCard
                topPatients={data.topPatients}
                isDarkMode={isDarkMode}
              />
              <PendingApprovalsCard
                count={data.pendingApprovals}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={closeModal}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
