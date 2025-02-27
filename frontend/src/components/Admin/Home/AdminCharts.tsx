import React from 'react'
import {BarChart , Bar , XAxis , YAxis , ResponsiveContainer} from 'recharts'

interface DailyRevenueData {
    day: string;
    revenue: number;
  }
  
  interface WorkHoursData {
    day: string;
    hours: number;
  }
  
  interface BookingStatus {
    name: string;
    value: number;
    color: string;
  }
  
  interface Appointment {
    id: string;
    doctorName: string;
    bookingDate: string;
  }

const AdminCharts :React.FC = () => {

    // Sample data for charts
  const revenueData: DailyRevenueData[] = [
    { day: 'Sun', revenue: 2500 },
    { day: 'Mon', revenue: 2200 },
    { day: 'Tue', revenue: 2400 },
    { day: 'Wed', revenue: 2100 },
    { day: 'Thu', revenue: 2300 },
    { day: 'Fri', revenue: 2600 },
    { day: 'Sat', revenue: 2000 },
  ];

  const workHoursData: WorkHoursData[] = [
    { day: 'Sun', hours: 6 },
    { day: 'Mon', hours: 8 },
    { day: 'Tue', hours: 7 },
    { day: 'Wed', hours: 6 },
    { day: 'Thu', hours: 7 },
    { day: 'Fri', hours: 8 },
    { day: 'Sat', hours: 6 },
  ];


  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Daily Revenue</h3>
              <select className="border rounded px-3 py-1">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="revenue" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Work Hours Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Work Hours</h3>
              <select className="border rounded px-3 py-1">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workHoursData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="hours" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
    </div>
  )
}

export default AdminCharts
