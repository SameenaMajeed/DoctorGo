import { IBooking } from "../../models/commonModel/BookingModel";

export interface DashboardData {
  pendingApprovals: number;
  topPatients: Array<{ _id: string; name: string; totalBookings: number; totalSpent: number }>;
  recentBookings?: IBooking[];
  platformFreeTotal :  number
}

export interface IAdminDashboardService {
  getDashboardData(
    startDate?: Date,
    endDate?: Date,
    filter?: "daily" | "monthly" | "yearly",
    doctorId?: string,
    bookingId?: string
  ): Promise<DashboardData>;
}