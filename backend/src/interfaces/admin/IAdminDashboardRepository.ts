import { IBooking } from "../../models/commonModel/BookingModel";
import { DateRange } from "../../types/dashboardTypes";

export interface IAdminDashboardRepository {
  getTotalRevenue(
    dateFilter: { $gte: Date; $lte: Date },
    doctorId?: string
  ): Promise<number>;
  getBookingStats(
    dateFilter: { $gte: Date; $lte: Date },
    doctorId?: string
  ): Promise<{
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }>;
  getBookingTrends(
    dateFilter: { $gte: Date; $lte: Date },
    filter: "daily" | "monthly" | "yearly",
    doctorId?: string
  ): Promise<Array<{ date: string; count: number; revenue: number }>>;

  getPendingApprovals(): Promise<number>;

  getPatientGrowth(
    dateFilter: { $gte: Date; $lte: Date },
    filter: "daily" | "monthly" | "yearly"
  ): Promise<Array<{ date: string; count: number }>>;
  getOverviewCounts(doctorId?: string): Promise<{
    totalBookings: number;
    activeDoctors: number;
    activePatients: number;
  }>;

  getTopDoctors(
    dateFilter: { $gte: Date; $lte: Date },
    doctorId?: string
  ): Promise<
    Array<{ _id: string; name: string; revenue: number; bookings: number }>
  >;

  getSpecialtyActivity(
    dateFilter: { $gte: Date; $lte: Date },
    doctorId?: string
  ): Promise<Array<{ _id: string; name: string; bookings: number }>>;

  getTopPatients(
    dateFilter: { $gte: Date; $lte: Date },
    doctorId?: string
  ): Promise<
    Array<{
      _id: string;
      name: string;
      totalBookings: number;
      totalSpent: number;
    }>
  >;
  getRecentBookings(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<IBooking[]>;
}
