import { IBooking } from "../../models/commonModel/BookingModel";
import { DateRange } from "../../types/dashboardTypes";

export interface IAdminDashboardRepository {

  getPendingApprovals(): Promise<number>;

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

  getPlatformFreeTotal(dateFilter: DateRange, doctorId?: string): Promise<number>

  getTotalBookings(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<Number>;
}
