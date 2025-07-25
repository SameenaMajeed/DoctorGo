import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../slice/Store/Store";
import { toast } from "react-hot-toast";
import { createApiInstance } from "../../../axios/apiService";
// import doctorApi from "../../../axios/DoctorInstance";

interface DashboardStatsData {
  totalPatients: number;
  newPatients: number;
  totalPrescriptions: number;
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  recentPatients: Array<{
    _id: string;
    name: string;
    phone: string;
    age : string;
    profilePicture : string
  }>;
}

const doctorApi = createApiInstance("doctor");

const DashboardStats: React.FC = () => {
  const  doctor = useSelector((state: RootState) => state.doctor.doctor);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!doctor?._id) return;

        const response = await doctorApi.get(`/${doctor._id}/dashboard-stats`);
        console.log("response:", response.data.data);
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
    return (
      <div className="text-center py-8">Loading dashboard statistics...</div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8">Failed to load statistics</div>;
  }

  return (
  <div className="p-6">

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Patients */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Total Patients</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-bold text-blue-600">
            {stats.totalPatients}+
          </span>
        </div>
      </div>

      {/* New Patients */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">New Patients</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-bold text-green-600">
            {stats.newPatients}+
          </span>
        </div>
      </div>

      {/* Prescriptions */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Prescriptions</h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-bold text-purple-600">
            {stats.totalPrescriptions}+
          </span>
        </div>
      </div>

      {/* Appointment Overview */}
      <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Appointment Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Appointments */}
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Appointments</p>
            <p className="text-2xl font-bold text-blue-700">
              {stats.totalAppointments}
            </p>
          </div>

          {/* Today's Appointments */}
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <p className="text-2xl font-bold text-green-700">
              {stats.todayAppointments}
            </p>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Upcoming Appointments</p>
            <p className="text-2xl font-bold text-yellow-700">
              {stats.upcomingAppointments}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      {/* <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Patients
        </h3>
        <div className="space-y-4">
          {stats.recentPatients.map((patient) => (
            <div
              key={patient._id}
              className="flex items-center justify-between border-b pb-3 hover:bg-gray-50 rounded-lg px-2 transition"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={
                    patient.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      patient.name
                    )}&background=random&size=128`
                  }
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover border shadow-sm"
                />
                <div>
                  <h4 className="text-md font-semibold text-gray-800">
                    {patient.name}
                  </h4>
                  <p className="text-sm text-gray-600">Age: {patient.age}</p>
                  <p className="text-sm text-gray-500">{patient.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  </div>
);

};

export default DashboardStats;
