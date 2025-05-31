import React, { useState, useEffect, useCallback } from "react";
import adminApi from "../../axios/AdminInstance";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { RefreshCw, Filter, Info, X, Download, Sun, Moon } from "lucide-react";
import AdminSidebar from "../../components/Admin/Home/AdminSidebar";
import AdminProfile from "../../components/Admin/Home/AdminProfile";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PAYMENT_FAILED = "payment_failed",
  CANCELLED = "cancelled",
  PAYMENT_PENDING = "payment_pending",
  EXPIRED = "expired",
  COMPLETED = "completed",
}

interface IBooking {
  _id: string;
  doctor_id: {
    _id: string;
    name: string;
    specialty: string;
  };
  user_id: {
    _id: string;
    name: string;
  };
  ticketPrice: number;
  discount?: number;
  status: AppointmentStatus;
  appointmentDate: string;
}

interface IDashboardSummary {
  totalRevenue: number;
  totalBookings: number;
  activeDoctors: number;
  activePatients: number;
}

interface IBookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

interface ITrend {
  date: string;
  count: number;
  revenue: number;
}

interface ISpecialtyActivity {
  _id: string;
  name: string;
  bookings: number;
}

interface ITopPatient {
  _id: string;
  name: string;
  totalBookings: number;
  totalSpent: number;
}

interface IPatientGrowth {
  date: string;
  count: number;
}

interface IDoctor {
  _id: string;
  name: string;
}

interface IDashboardData {
  overview: IDashboardSummary;
  bookingStats: IBookingStats;
  bookingTrends: ITrend[];
  topDoctors: Array<{
    _id: string;
    name: string;
    revenue: number;
    bookings: number;
  }>;
  specialtyActivity: ISpecialtyActivity[];
  pendingApprovals: number;
  topPatients: ITopPatient[];
  patientGrowth: IPatientGrowth[];
  recentBookings?: IBooking[];
}

const AdminDashBoard: React.FC = () => {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [recentBookings, setRecentBookings] = useState<IBooking[]>([]);
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "daily" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch list of doctors for filtering
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await adminApi.get("/doctor");
        const doctorData = response.data.data;
        console.log("doctorData:", doctorData.doctors);
        setDoctors(doctorData.doctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch dashboard data with debouncing
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
       // Add doctor filter if selected
    if (selectedDoctor) {
      params.doctorId = selectedDoctor;
    }

      if (filter === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (filter !== "custom") {
        params.filter = filter;
      }

      const response: any = await adminApi.get("/dashboard", { params });
      const dashboardData = response.data.data;
      console.log('recentBookings : ' ,dashboardData.recentBookings)
      setData(dashboardData);
      setRecentBookings(dashboardData.recentBookings || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filter, startDate, endDate, selectedDoctor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (
    newFilter: "daily" | "monthly" | "yearly" | "custom"
  ) => {
    setFilter(newFilter);
    if (newFilter !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) fetchData();
    else alert("Please select both start and end dates");
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    fetchData();
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctor(e.target.value);
  };

  const handleViewBookingDetails = (booking: IBooking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const handleRetry = () => {
    fetchData();
  };

  // const handleDownloadReport = () => {
  //   if (!data) return;

  //   const csvRows = [];
  //   // Overview
  //   csvRows.push("Overview");
  //   csvRows.push("Metric,Value");
  //   Object.entries(data.overview).forEach(([key, value]) => {
  //     csvRows.push(`${key.replace(/([A-Z])/g, " $1").trim()},${value}`);
  //   });

  //   // Booking Stats
  //   csvRows.push("\nBooking Stats");
  //   csvRows.push("Status,Count");
  //   Object.entries(data.bookingStats).forEach(([status, count]) => {
  //     csvRows.push(`${status},${count}`);
  //   });

  //   // // Booking Trends
  //   // csvRows.push("\nBooking Trends");
  //   // csvRows.push("Date,Bookings,Revenue");
  //   // data.bookingTrends.forEach((trend) => {
  //   //   csvRows.push(`${trend.date},${trend.count},${trend.revenue}`);
  //   // });

  //   // Top Doctors
  //   csvRows.push("\nTop Doctors");
  //   csvRows.push("Doctor,Revenue,Bookings");
  //   data.topDoctors.forEach((doctor) => {
  //     csvRows.push(`${doctor.name},${doctor.revenue},${doctor.bookings}`);
  //   });

  //   // Specialty Activity
  //   csvRows.push("\nSpecialty Activity");
  //   csvRows.push("Specialty,Bookings");
  //   data.specialtyActivity.forEach((specialty) => {
  //     csvRows.push(`${specialty.name},${specialty.bookings}`);
  //   });

  //   // Top Patients
  //   csvRows.push("\nTop Patients");
  //   csvRows.push("Patient,Total Bookings,Total Spent");
  //   data.topPatients.forEach((patient) => {
  //     csvRows.push(
  //       `${patient.name},${patient.totalBookings},${patient.totalSpent}`
  //     );
  //   });

  //   // Patient Growth
  //   csvRows.push("\nPatient Growth");
  //   csvRows.push("Date,New Patients");
  //   data.patientGrowth.forEach((growth) => {
  //     csvRows.push(`${growth.date},${growth.count}`);
  //   });

  //   // Recent Bookings
  //   csvRows.push("\nRecent Bookings");
  //   csvRows.push("Doctor,Patient,Price,Status,Date");
  //   recentBookings.forEach((booking) => {
  //     csvRows.push(
  //       `${booking.doctor_id.name},${booking.user_id.name},${
  //         booking.ticketPrice
  //       },${booking.status},${new Date(
  //         booking.appointmentDate
  //       ).toLocaleDateString()}`
  //     );
  //   });

  //   const csvContent = csvRows.join("\n");
  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `DoctorGo_Dashboard_Report_${
  //     new Date().toISOString().split("T")[0]
  //   }.csv`;
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

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
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Retry loading dashboard data"
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

  // Chart Data
  const bookingStatsData = {
    labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
    datasets: [
      {
        data: [
          data.bookingStats.pending,
          data.bookingStats.confirmed,
          data.bookingStats.completed,
          data.bookingStats.cancelled,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#E7E9ED"],
      },
    ],
  };

  // const bookingTrendsData = {
  //   labels: data.bookingTrends.map((t) => t.date),
  //   datasets: [
  //     { label: "Bookings", data: data.bookingTrends.map((t) => t.count), borderColor: "#36A2EB", fill: false },
  //     { label: "Revenue", data: data.bookingTrends.map((t) => t.revenue), borderColor: "#FF6384", fill: false },
  //   ],
  // };

  const topDoctorsData = {
    labels: data.topDoctors.map((d) => d.name),
    datasets: [
      {
        label: "Revenue",
        data: data.topDoctors.map((d) => d.revenue),
        backgroundColor: "#10B981",
      },
    ],
  };

  const specialtyActivityData = {
    labels: data.specialtyActivity.map((s) => s.name),
    datasets: [
      {
        label: "Bookings",
        data: data.specialtyActivity.map((s) => s.bookings),
        backgroundColor: "#FBBF24",
      },
    ],
  };

  const patientGrowthData = {
    labels: data.patientGrowth.map((u) => u.date),
    datasets: [
      {
        label: "New Patients",
        data: data.patientGrowth.map((u) => u.count),
        borderColor: "#4CAF50",
        fill: false,
      },
    ],
  };

  // Chart Options with Tooltips
  const baseLineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: isDarkMode ? "#e5e7eb" : "#6b7280" },
      },
      title: {
        display: true,
        font: { size: 16 },
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
      },
      tooltip: { enabled: true, mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: isDarkMode ? "#e5e7eb" : "#6b7280" } },
      y: {
        ticks: { color: isDarkMode ? "#e5e7eb" : "#6b7280" },
        beginAtZero: true,
      },
    },
    interaction: { mode: "nearest", intersect: false },
  };

  const basePieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: isDarkMode ? "#e5e7eb" : "#6b7280" },
      },
      title: {
        display: true,
        font: { size: 16 },
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
      },
      tooltip: { enabled: true },
    },
  };

  const baseBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: isDarkMode ? "#e5e7eb" : "#6b7280" },
      },
      title: {
        display: true,
        font: { size: 16 },
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: isDarkMode ? "#e5e7eb" : "#6b7280" } },
      y: {
        ticks: { color: isDarkMode ? "#e5e7eb" : "#6b7280" },
        beginAtZero: true,
      },
    },
  };

  const withTitle = <T extends "line" | "pie" | "bar">(
    options: ChartOptions<T>,
    title: string
  ): ChartOptions<T> => {
    return {
      ...options,
      plugins: {
        ...(options?.plugins || {}),
        title: {
          ...(options?.plugins?.title || {}),
          display: true,
          text: title,
        },
      },
    };
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-50 text-gray-900"
      }`}
    >
      <AdminSidebar />
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div
            className={`rounded-2xl shadow-xl p-6 sm:p-8 ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Admin Dashboard
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } mt-2`}
                >
                  Overview of your DoctorGo platform as of{" "}
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
                    } mt-1`}
                  >
                    Last Updated:{" "}
                    {lastUpdated.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    on{" "}
                    {lastUpdated.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
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
                  } transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500`}
                  aria-label={
                    isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                {/* <button
                  onClick={handleDownloadReport}
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "bg-gray-800 text-emerald-400 hover:bg-gray-700"
                      : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  } transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-emerald-500`}
                  aria-label="Download dashboard report as CSV"
                >
                  <Download className="w-5 h-5" />
                </button> */}
                <button
                  onClick={handleRefresh}
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "bg-gray-800 text-blue-400 hover:bg-gray-700"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  } ${
                    isRefreshing ? "animate-spin" : ""
                  } transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500`}
                  aria-label="Refresh dashboard data"
                  disabled={isRefreshing}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <AdminProfile />
              </div>
            </div>

            {/* Filters and Doctor Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="flex items-center space-x-3">
                  <Filter
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {["daily", "monthly", "yearly", "custom"].map((f) => (
                      <button
                        key={f}
                        onClick={() => handleFilterChange(f as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 ${
                          filter === f
                            ? "bg-blue-600 text-white"
                            : isDarkMode
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                        aria-label={`Filter by ${f}`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {filter === "custom" && (
                  <form
                    onSubmit={handleCustomDateSubmit}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`p-2 border rounded-lg text-sm ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-300 focus:ring-gray-500"
                          : "bg-white border-gray-200 text-gray-900 focus:ring-blue-500"
                      } focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 transition-colors`}
                      aria-label="Select start date"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`p-2 border rounded-lg text-sm ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-300 focus:ring-gray-500"
                          : "bg-white border-gray-200 text-gray-900 focus:ring-blue-500"
                      } focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 transition-colors`}
                      aria-label="Select end date"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
                      aria-label="Apply custom date filter"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>
              <select
                value={selectedDoctor}
                onChange={handleDoctorChange}
                className={`p-2 border rounded-lg w-full sm:w-48 text-sm ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-300 focus:ring-gray-500"
                    : "bg-white border-gray-200 text-gray-900 focus:ring-blue-500"
                } focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 transition-colors`}
                aria-label="Select doctor to filter"
              >
                <option value="">All Doctors</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {Object.entries(data.overview).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-4 sm:p-6 rounded-xl shadow-sm border transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h2
                    className={`text-sm font-semibold capitalize ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h2>
                  <p
                    className={`text-2xl sm:text-3xl font-bold mt-3 ${
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {key === "totalRevenue"
                      ? `₹${value.toLocaleString()}`
                      : value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div
                className={`p-4 sm:p-6 rounded-xl shadow-sm border h-[45vh] min-h-[280px] max-h-[400px] ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <Pie
                  data={bookingStatsData}
                  options={withTitle<"pie">(basePieOptions, "Booking Status")}
                />
              </div>
              <div
                className={`p-4 sm:p-6 rounded-xl shadow-sm border h-[45vh] min-h-[280px] max-h-[400px] ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <Bar
                  data={topDoctorsData}
                  options={withTitle<"bar">(
                    baseBarOptions,
                    "Top Doctors by Revenue"
                  )}
                />
              </div>
              {/* <div
                className={`p-4 sm:p-6 rounded-xl shadow-sm border h-[45vh] min-h-[280px] max-h-[400px] ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <Bar
                  data={specialtyActivityData}
                  options={withTitle<"bar">(
                    baseBarOptions,
                    "Specialty Activity"
                  )}
                />
              </div> */}
              {/* <div
                className={`p-4 sm:p-6 rounded-xl shadow-sm border h-[45vh] min-h-[280px] max-h-[400px] md:col-span-2 lg:col-span-3 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <Line
                  data={patientGrowthData}
                  options={withTitle<"line">(baseLineOptions, "Patient Growth")}
                />
              </div> */}
            </div>

            {/* Recent Bookings */}
            <div
              className={`rounded-xl shadow-sm border mb-8 sm:mb-10 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <h2
                className={`text-xl sm:text-2xl font-semibold p-4 sm:p-6 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                Recent Bookings
              </h2>
              <div className="overflow-x-auto p-4 sm:p-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    className={`${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
                  >
                    <tr>
                      {[
                        "Doctor",
                        "Patient",
                        "Price",
                        "Status",
                        "Date",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDarkMode ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking, index) => (
                        <tr
                          key={booking._id}
                          className={`${
                            index % 2 === 0
                              ? isDarkMode
                                ? "bg-gray-800"
                                : "bg-white"
                              : isDarkMode
                              ? "bg-gray-700"
                              : "bg-gray-50"
                          } hover:bg-opacity-90 transition-colors duration-200`}
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {booking.doctor_id.name}
                          </td>
                          <td
                            className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {booking.user_id.name}
                          </td>
                          <td
                            className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            ₹{booking.ticketPrice.toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === "completed"
                                  ? isDarkMode
                                    ? "bg-green-900 text-green-300"
                                    : "bg-green-100 text-green-800"
                                  : booking.status === "cancelled"
                                  ? isDarkMode
                                    ? "bg-red-900 text-red-300"
                                    : "bg-red-100 text-red-800"
                                  : booking.status === "confirmed"
                                  ? isDarkMode
                                    ? "bg-blue-900 text-blue-300"
                                    : "bg-blue-100 text-blue-800"
                                  : isDarkMode
                                  ? "bg-yellow-900 text-yellow-300"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td
                            className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {new Date(
                              booking.appointmentDate
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleViewBookingDetails(booking)}
                              className={`flex items-center gap-1 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500 ${
                                isDarkMode
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-800"
                              }`}
                              aria-label={`View details for booking by ${booking.user_id.name}`}
                            >
                              <Info className="w-4 h-4" /> Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className={`px-4 sm:px-6 py-4 text-center text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          No recent bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Patients and Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div
                className={`p-4 sm:p-6 rounded-xl shadow-sm border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Top Patients
                </h2>
                <ul className="space-y-3">
                  {data.topPatients.map((p) => (
                    <li
                      key={p._id}
                      className={`text-sm sm:text-base ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      } flex items-center gap-2`}
                    >
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {p.name} - {p.totalBookings} bookings, ₹
                      {p.totalSpent.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`p-4 sm:p-6 rounded-xl shadow-sm border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Pending Approvals
                </h2>
                <p
                  className={`text-sm sm:text-base ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {data.pendingApprovals} booking
                  {data.pendingApprovals !== 1 ? "s" : ""} awaiting approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-2xl p-6 sm:p-8 w-full max-w-lg mx-4 shadow-lg ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold">
                Booking Details
              </h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500 ${
                  isDarkMode
                    ? "text-gray-400 hover:bg-gray-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                aria-label="Close booking details modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Booking ID:</span>{" "}
                {selectedBooking._id}
              </p>
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Doctor:</span>{" "}
                {selectedBooking.doctor_id.name} (
                {selectedBooking.doctor_id.specialty})
              </p>
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Patient:</span>{" "}
                {selectedBooking.user_id.name}
              </p>
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Price:</span> ₹
                {selectedBooking.ticketPrice.toLocaleString()}
                {selectedBooking.discount ? (
                  <span className="text-green-600 dark:text-green-400">
                    {" "}
                    (Discount: ₹{selectedBooking.discount})
                  </span>
                ) : (
                  ""
                )}
              </p>
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedBooking.status === "completed"
                      ? isDarkMode
                        ? "bg-green-900 text-green-300"
                        : "bg-green-100 text-green-800"
                      : selectedBooking.status === "cancelled"
                      ? isDarkMode
                        ? "bg-red-900 text-red-300"
                        : "bg-red-100 text-red-800"
                      : selectedBooking.status === "confirmed"
                      ? isDarkMode
                        ? "bg-blue-900 text-blue-300"
                        : "bg-blue-100 text-blue-800"
                      : isDarkMode
                      ? "bg-yellow-900 text-yellow-300"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </p>
              <p className="text-sm sm:text-base">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedBooking.appointmentDate).toLocaleString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                aria-label="Close booking details modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashBoard;

// import React from 'react'
// import AdminSidebar from '../../components/Admin/Home/AdminSidebar'
// import AdminProfile from '../../components/Admin/Home/AdminProfile'

// const AdminDashBoard  : React.FC= () => {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AdminSidebar/>
//       <AdminProfile/>
//        {/* Main Content */}
//        <div className="ml-64 p-8">
//           Welcome to Dashboard
//         </div>

//     </div>
//   )
// }

// export default AdminDashBoard
