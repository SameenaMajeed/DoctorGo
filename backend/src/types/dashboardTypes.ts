import { Document, Types } from "mongoose";

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
  topDoctors: Array<{ id: string; name: string; revenue: number; bookings: number }>;
  specialtyActivity: Array<{ id: string; name: string; bookings: number }>;
  pendingApprovals: number;
  topPatients: Array<{ id: string; name: string; totalBookings: number; totalSpent: number }>;
  patientGrowth: Array<{ date: string; count: number }>;
}

export type DateRange = { $gte: Date; $lte: Date };
export type DashboardFilter = "daily" | "monthly" | "yearly";