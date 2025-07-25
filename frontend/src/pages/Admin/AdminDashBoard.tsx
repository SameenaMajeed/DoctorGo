import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  Eye,
  IndianRupee,
} from "lucide-react";
import adminApi from "../../axios/AdminInstance";
import AdminSidebar from "../../components/Admin/Home/AdminSidebar";
import Header from "../../components/Admin/Home/Header";
import {
  DashboardFilter,
  DashboardFilters,
  IBooking,
  IDashboardData,
} from "../../Types";
import { AppointmentStatus } from "../../types/paymentTypes";
import Loader from "../../components/Admin/Loader";
import ErrorDisplay from "../../components/Admin/Home/ErrorDisplay";
import { Table } from "../../components/CommonComponents/Table";
import BookingDetailModal from "../../components/Admin/Home/BookingDetailModal";

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  // const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    filter: "monthly",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};

      // Add filter parameters
      if (filters.filter !== "custom") {
        params.filter = filters.filter;
      }

      if (filters.filter === "custom" && filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      if (filters.doctorId) {
        params.doctorId = filters.doctorId;
      }

      const response = await adminApi.get("/dashboard", { params });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard data"
        );
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data. Please try again later."
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      fetchDashboardData();
    }
  }

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }));
  };

  const handleViewBookingDetails = (booking: IBooking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case AppointmentStatus.CONFIRMED:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case AppointmentStatus.PENDING:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case AppointmentStatus.CANCELLED:
        return "bg-red-50 text-red-700 border-red-200";
      case AppointmentStatus.PAYMENT_PENDING:
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case AppointmentStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4" />;
      case AppointmentStatus.PENDING:
        return <Clock className="w-4 h-4" />;
      case AppointmentStatus.CANCELLED:
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const recentBookingColumns = [
    {
      header: "Patient",
      render: (booking: any) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {booking.user_id.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {booking.user_id.name}
            </div>
            <div className="text-sm text-gray-500">
              {booking.patientDetails.contactNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Doctor",
      render: (booking: any) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {booking.doctor_id.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {booking.doctor_id.name}
            </div>
            <div className="text-sm text-gray-500">
              {booking.doctor_id.specialization}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Date & Time",
      render: (booking: any) => (
        <>
          <div className="text-sm text-gray-900">
            {formatDate(booking.appointmentDate)}
          </div>
          <div className="text-sm text-gray-500">
            {formatTime(booking.appointmentTime)}
          </div>
        </>
      ),
    },
    {
      header: "Amount",
      render: (booking: any) => (
        <>
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(booking.totalAmount)}
          </div>
          <div className="text-sm text-gray-500">
            {booking.modeOfAppointment}
          </div>
        </>
      ),
    },
    {
      header: "Status",
      render: (booking: any) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
            booking.status
          )}`}
        >
          {getStatusIcon(booking.status)}
          {booking.status.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (booking: any) => (
        <button
          onClick={() => handleViewBookingDetails(booking)}
          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      ),
    },
  ];

  const topPatientsColumns = [
    {
      header: "Patient",
      render: (patient: any) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {patient.name}
            </div>
            <div className="text-sm text-gray-500">
              {patient.totalBookings} bookings
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Total Spent",
      render: (patient: any) => (
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(patient.totalSpent)}
          </div>
          <div className="text-sm text-gray-500">Total spent</div>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  if (error) return <ErrorDisplay error={error} />;

  if (!data) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600">
              Unable to load dashboard information at this time.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen ${
        // isDarkMode
        //   ? "bg-gray-900 text-gray-300" :
         "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}
    >
      <AdminSidebar />
      <div className="flex-1">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section with Filters */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    Admin Dashboard
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Welcome back! Here's what's happening with your platform
                    today.
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    Overview as of{" "}
                    {new Date().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Filter className="w-4 h-4" />
                      <select
                        value={filters.filter}
                        onChange={(e) =>
                          handleFilterChange({
                            filter: e.target.value as DashboardFilter,
                          })
                        }
                        className="bg-transparent text-white text-sm font-medium focus:outline-none"
                      >
                        <option value="daily" className="text-gray-900">
                          Daily
                        </option>
                        <option value="monthly" className="text-gray-900">
                          Monthly
                        </option>
                        <option value="yearly" className="text-gray-900">
                          Yearly
                        </option>
                        <option value="custom" className="text-gray-900">
                          Custom Range
                        </option>
                      </select>
                    </div>
                  </div>

                  {filters.filter === "custom" && (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={filters.startDate || ""}
                        onChange={(e) =>
                          handleFilterChange({ startDate: e.target.value })
                        }
                        className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                      <input
                        type="date"
                        value={filters.endDate || ""}
                        onChange={(e) =>
                          handleFilterChange({ endDate: e.target.value })
                        }
                        className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    <span className="text-sm font-medium">Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Bookings */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Total Bookings
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data.totalBookings}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600 text-xs font-medium">
                        Recent bookings
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Active Patients */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Top Patients
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data.topPatients.length}
                    </p>
                    <div className="flex items-center mt-2">
                      <Users className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600 text-xs font-medium">
                        Active users
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data.pendingApprovals}
                    </p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-amber-500 mr-1" />
                      <span className="text-amber-600 text-xs font-medium">
                        Requires attention
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Platform Revenue */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Platform Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(data.platformFreeTotal)}
                    </p>
                    <div className="flex items-center mt-2">
                      <IndianRupee className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600 text-xs font-medium">
                        Total earnings
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Bookings - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Recent Bookings
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Latest appointment bookings and their status
                      </p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                      {data.recentBookings.length} Total
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table
                    columns={recentBookingColumns}
                    data={data.recentBookings}
                    loading={false}
                  />
                </div>
              </div>

              {/* Top Patients - Takes 1 column */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    Top Patients
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Most active patients by bookings
                  </p>
                </div>
                <Table
                  columns={topPatientsColumns}
                  data={data.topPatients}
                  loading={false}
                />
              </div>
            </div>
          </div>

          {/* Booking Details Modal */}
          {selectedBooking && (
            <BookingDetailModal
              booking={selectedBooking}
              onClose={closeModal}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
