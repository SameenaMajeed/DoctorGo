import { IBooking } from "../../models/commonModel/BookingModel";

export interface DashboardData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    activeDoctors: number;
    activePatients: number;
  };
  bookingStats: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  bookingTrends: Array<{ date: string; count: number; revenue: number }>;
  topDoctors: Array<{ _id: string; name: string; revenue: number; bookings: number }>;
  specialtyActivity: Array<{ _id: string; name: string; bookings: number }>;
  pendingApprovals: number;
  topPatients: Array<{ _id: string; name: string; totalBookings: number; totalSpent: number }>;
  patientGrowth: Array<{ date: string; count: number }>;
  recentBookings?: IBooking[];
}

export interface IAdminDashboardService {
  getDashboardData(
    startDate?: Date,
    endDate?: Date,
    filter?: "daily" | "monthly" | "yearly",
    doctorId?: string
  ): Promise<DashboardData>;
}