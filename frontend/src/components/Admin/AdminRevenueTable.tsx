"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  DollarSign,
  User,
  Calendar,
  TrendingUp,
  Stethoscope,
  BarChart3,
  RefreshCw,
  Download,
  Search,
  Filter,
} from "lucide-react";
// import adminApi from "../../axios/AdminInstance";
import Loader from "./Loader";
import ErrorDisplay from "./Home/ErrorDisplay";
import { DoctorRevenue } from "../../Types";
import { Table } from "../CommonComponents/Table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { createApiInstance } from "../../axios/apiService";

const adminApi = createApiInstance("admin");

const AdminRevenueTable: React.FC = () => {
  const [revenueData, setRevenueData] = useState<DoctorRevenue[]>([]);
  const [filteredData, setFilteredData] = useState<DoctorRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof DoctorRevenue>("totalRevenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDoctorsRevenue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.get("/doctors/revenue");
      console.log("Result : ", response.data.data);
      const data = response.data.data.result.map((doc: any) => ({
        ...doc,
        averageRevenuePerAppointment:
          doc.totalAppointments > 0
            ? doc.totalRevenue / doc.totalAppointments
            : 0,
      }));
      setRevenueData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      setError("Failed to load doctor details. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctorsRevenue();
  }, []);

  // Search and filter logic
  useEffect(() => {
    const filtered = revenueData.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort logic
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredData(filtered);
  }, [revenueData, searchTerm, sortBy, sortOrder]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      fetchDoctorsRevenue();
    }
  };

  const handleSort = (key: keyof DoctorRevenue, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return filteredData.reduce((sum, doc) => sum + doc.totalRevenue, 0);
  };

  const getTotalAppointments = () => {
    return filteredData.reduce((sum, doc) => sum + doc.totalAppointments, 0);
  };

  const getAverageRevenue = () => {
    const total = getTotalRevenue();
    const count = filteredData.length;
    return count > 0 ? total / count : 0;
  };

  const handleExport = () => {
    const exportData = filteredData.map((doc) => ({
      Name: doc.name,
      Email: doc.email,
      Specialization: doc.specialization || "General Physician",
      Appointments: doc.totalAppointments,
      "Total Revenue": doc.totalRevenue,
      "Avg per Appointment": doc.averageRevenuePerAppointment?.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doctor Revenue");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "doctor_revenue.xlsx");
  };

  // Define table columns
  const columns = [
    {
      header: "Doctor",
      render: (doc: DoctorRevenue) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
            {doc.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {doc.name}
            </div>
            <div className="text-xs text-gray-500">
              {doc.specialization || "General Physician"}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "name" as keyof DoctorRevenue,
    },
    {
      header: "Contact",
      render: (doc: DoctorRevenue) => (
        <div>
          <div className="text-sm text-gray-900">{doc.email}</div>
          <div className="text-xs text-gray-500">Primary contact</div>
        </div>
      ),
    },
    {
      header: "Appointments",
      render: (doc: DoctorRevenue) => (
        <div>
          <div className="text-sm font-bold text-gray-900">
            {doc.totalAppointments.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total sessions</div>
        </div>
      ),
      sortable: true,
      sortKey: "totalAppointments" as keyof DoctorRevenue,
    },
    {
      header: "Total Revenue",
      render: (doc: DoctorRevenue) => (
        <div>
          <div className="text-sm font-bold text-green-600">
            {formatCurrency(doc.totalRevenue)}
          </div>
          <div className="text-xs text-gray-500">Total earnings</div>
        </div>
      ),
      sortable: true,
      sortKey: "totalRevenue" as keyof DoctorRevenue,
    },
    {
      header: "Avg per Appointment",
      render: (doc: DoctorRevenue) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(doc.averageRevenuePerAppointment || 0)}
          </div>
          <div className="text-xs text-gray-500">Per session</div>
        </div>
      ),
      sortable: true,
      sortKey: "averageRevenuePerAppointment" as keyof DoctorRevenue,
    },
  ];

  if (loading) return <Loader />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Doctor Revenue Analytics
              </h1>
              <p className="text-green-100 text-sm sm:text-base">
                Comprehensive revenue tracking and performance metrics for all
                doctors
              </p>
              <p className="text-green-200 text-xs mt-1">
                Updated as of{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="text-sm font-medium">Refresh</span>
              </button>

              <button
                onClick={handleExport}
                className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Doctors
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredData.length}
                </p>
                <div className="flex items-center mt-2">
                  <User className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 text-xs font-medium">
                    Active doctors
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(getTotalRevenue())}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 text-xs font-medium">
                    All time earnings
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {getTotalAppointments().toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <Calendar className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 text-xs font-medium">
                    Completed sessions
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Average Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(getAverageRevenue())}
                </p>
                <div className="flex items-center mt-2">
                  <BarChart3 className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-orange-600 text-xs font-medium">
                    Per doctor
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Table Header with Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Doctor Revenue Details
                </h2>
                <p className="text-gray-500 text-sm">
                  Detailed breakdown of doctor performance and earnings
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[200px]"
                  />
                </div>

                {/* Sort Filter */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [column, order] = e.target.value.split("-");
                      setSortBy(column as keyof DoctorRevenue);
                      setSortOrder(order as "asc" | "desc");
                    }}
                    className="bg-transparent text-sm font-medium focus:outline-none"
                  >
                    <option value="totalRevenue-desc">
                      Revenue (High to Low)
                    </option>
                    <option value="totalRevenue-asc">
                      Revenue (Low to High)
                    </option>
                    <option value="totalAppointments-desc">
                      Appointments (High to Low)
                    </option>
                    <option value="totalAppointments-asc">
                      Appointments (Low to High)
                    </option>
                    <option value="name-asc">Name (A to Z)</option>
                    <option value="name-desc">Name (Z to A)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Reusable Table Component */}
          <Table
            columns={columns}
            data={filteredData}
            loading={false} // We handle loading separately
            emptyMessage={
              searchTerm
                ? `No doctors match "${searchTerm}"`
                : "No revenue data available at this time."
            }
            emptyIcon={<Search className="w-8 h-8 text-gray-400" />}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />

          {/* Table Footer */}
          {filteredData.length > 0 && (
            <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredData.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {revenueData.length}
                  </span>{" "}
                  doctors
                </div>
                <div className="text-sm text-gray-600">
                  Total Revenue:{" "}
                  <span className="font-semibold text-green-600">
                    {formatCurrency(getTotalRevenue())}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueTable;

// import { useEffect, useState } from "react";
// import adminApi from "../../axios/AdminInstance";
// import Loader from "./Loader";
// import ErrorDisplay from "./Home/ErrorDisplay";

// const AdminRevenueTable = () => {
//   const [revenueData, setRevenueData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchDoctorsRevenue = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await adminApi.get("/doctors/revenue");
//       console.log("Result : ",response.data.data)
//       setRevenueData(response.data.data.result);
//     } catch (error) {
//       console.error("Error fetching doctor details:", error);
//       setError("Failed to load doctor details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDoctorsRevenue();
//   }, []);

//   console.log(revenueData)

//   if (loading) return <Loader />;

//   if (error) return <ErrorDisplay error={error} />;

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full bg-white border">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="px-6 py-3 text-left">Doctor</th>
//             <th className="px-6 py-3 text-left">Email</th>
//             <th className="px-6 py-3 text-left">Appointments</th>
//             <th className="px-6 py-3 text-left">Total Revenue</th>
//           </tr>
//         </thead>
//         <tbody>
//           {revenueData.map((doc: any, idx) => (
//             <tr key={idx} className="border-t">
//               <td className="px-6 py-4">{doc.name}</td>
//               <td className="px-6 py-4">{doc.email}</td>
//               <td className="px-6 py-4">{doc.totalAppointments}</td>
//               <td className="px-6 py-4">₹{doc.totalRevenue.toFixed(2)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AdminRevenueTable;
