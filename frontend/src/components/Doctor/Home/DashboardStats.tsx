import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../slice/Store/Store";
import { toast } from "react-hot-toast";
import doctorApi from "../../../axios/DoctorInstance";

interface DashboardStatsData {
  totalPatients: number;
  newPatients: number;
  totalPrescriptions: number;
  totalEarnings: number;
  monthlyEarnings: { month: number; total: number }[];
  recentPatients: Array<{
    _id: string;
    name: string;
    phone: string;
    prescriptions: Array<{
      _id: string;
      name: string;
    }>;
  }>;
}

const DashboardStats: React.FC = () => {
  const { doctor } = useSelector((state: RootState) => state.doctor);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!doctor?._id) return;
        
        const response = await doctorApi.get(`/${doctor._id}/dashboard-stats`);
        console.log('response:',response.data.data)
        setStats(response.data.data);
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [doctor?._id]);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard statistics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">Failed to load statistics</div>;
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {/* Total Patients Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Total Patients</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-bold text-blue-600">{stats.totalPatients}+</span>
          {/* <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            +45.06%
          </span> */}
        </div>
      </div>

      {/* New Patients Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">New Patients</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-bold text-green-600">{stats.newPatients}+</span>
          {/* <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            +25.06%
          </span> */}
        </div>
      </div>

      {/* Prescriptions Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Prescriptions</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-bold text-purple-600">{stats.totalPrescriptions}+</span>
          {/* <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            +65.06%
          </span> */}
        </div>
      </div>

      {/* Total Earnings Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-bold text-yellow-600">${stats.totalEarnings}</span>
          {/* <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            +45.06%
          </span> */}
        </div>
      </div>

      {/* Earning Reports Section */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Earning Reports</h3>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">6.44%</span>
            <span className="text-sm text-gray-500">2.42%</span>
          </div>
          
          {/* Monthly Earnings */}
          <div className="flex space-x-4 overflow-x-auto py-4">
            {stats.monthlyEarnings.map((monthData) => (
              <div key={monthData.month} className="flex flex-col items-center">
                <span className="text-xs text-gray-500">{monthNames[monthData.month - 1]}</span>
                <span className="text-sm font-medium">${monthData.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Patients Section */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Recent Patients</h3>
        <div className="mt-4 space-y-4">
          {stats.recentPatients.map((patient) => (
            <div key={patient._id} className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-medium">{patient.name}</h4>
                <p className="text-sm text-gray-500">{patient.phone}</p>
              </div>
              <div className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                {patient.prescriptions.length > 0 
                  ? `${patient.prescriptions[0].name} Pk` 
                  : "No Rx"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;