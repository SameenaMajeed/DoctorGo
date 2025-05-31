import {
  IAdminDashboardService,
  DashboardData,
} from "../../interfaces/admin/IAdminDashboardService";
import { IAdminDashboardRepository } from "../../interfaces/admin/IAdminDashboardRepository";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";

type DateRange = { $gte: Date; $lte: Date };
type DashboardFilter = "daily" | "monthly" | "yearly";

export class AdminDashboardService implements IAdminDashboardService {
  constructor(private repository: IAdminDashboardRepository) {}

  // private getDefaultDateRange(filter: DashboardFilter): DateRange {
  //   const now = new Date();
  //    // Create a new date object to avoid mutation
  //   const startDate = new Date(now);
  //   if (filter === "daily") {
  //     const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  //     return {
  //       $gte: startOfDay,
  //       $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1),
  //     };
  //   }

  //   if (filter === "monthly") {
  //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //     return { $gte: startOfMonth, $lte: now };
  //   }

  //   // yearly
  //   const startOfYear = new Date(now.getFullYear(), 0, 1);
  //   return { $gte: startOfYear, $lte: now };
  // }

  private getDefaultDateRange(filter: DashboardFilter): DateRange {
    const now = new Date();
    const startDate = new Date(now); // Create a new date object to avoid mutation

    if (filter === "daily") {
      startDate.setHours(0, 0, 0, 0);
      return {
        $gte: startDate,
        $lte: new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    }

    if (filter === "monthly") {
      const startOfMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);
      return { $gte: startOfMonth, $lte: endOfMonth };
    }

    // yearly
    const startOfYear = new Date(startDate.getFullYear(), 0, 1);
    const endOfYear = new Date(startDate.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);
    return { $gte: startOfYear, $lte: endOfYear };
  }

  async getDashboardData(
    startDate?: Date,
    endDate?: Date,
    filter: DashboardFilter = "daily",
    doctorId?: string
  ): Promise<DashboardData> {
    try {
      console.log("Received filter:", filter);
      console.log("Start date:", startDate);
      console.log("End date:", endDate);

      const dateFilter =
        startDate && endDate
          ? { $gte: startDate, $lte: endDate }
          : this.getDefaultDateRange(filter);

      console.log('Date filter:', dateFilter);    

      // Execute all queries in parallel for better performance
      const [
        totalRevenue,
        bookingStats,
        bookingTrends,
        topDoctors,
        specialtyActivity,
        pendingApprovals,
        topPatients,
        patientGrowth,
        overviewCounts,
        recentBookings,
      ] = await Promise.all([
        this.repository.getTotalRevenue(dateFilter, doctorId),
        this.repository.getBookingStats(dateFilter, doctorId),
        this.repository.getBookingTrends(dateFilter, filter, doctorId),
        this.repository.getTopDoctors(dateFilter, doctorId),
        this.repository.getSpecialtyActivity(dateFilter, doctorId),
        this.repository.getPendingApprovals(),
        this.repository.getTopPatients(dateFilter, doctorId),
        this.repository.getPatientGrowth(dateFilter, filter),
        this.repository.getOverviewCounts(doctorId),
        this.repository.getRecentBookings(dateFilter, doctorId),
      ]);

      return {
        overview: {
          totalRevenue,
          totalBookings: overviewCounts.totalBookings,
          activeDoctors: overviewCounts.activeDoctors,
          activePatients: overviewCounts.activePatients,
        },
        bookingStats,
        bookingTrends,
        topDoctors,
        specialtyActivity,
        pendingApprovals,
        topPatients,
        patientGrowth,
        recentBookings,
      };
    } catch (error) {
      throw error instanceof AppError
        ? error
        : new AppError(
            HttpStatus.InternalServerError,
            MessageConstants.INTERNAL_SERVER_ERROR
          );
    }
  }
}
