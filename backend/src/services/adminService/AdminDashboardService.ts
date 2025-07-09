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

  private getDefaultDateRange(filter: DashboardFilter): DateRange {
    const now = new Date();
    const startDate = new Date(now); // Create a new date object to avoid mutation

    if (filter === "daily") {
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      return { $gte: startDate, $lte: endDate };
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
    doctorId?: string,
    bookingId?: string
  ): Promise<DashboardData> {
    try {
      console.log("Received filter:", filter);
      console.log("Start date:", startDate);
      console.log("End date:", endDate);

      const dateFilter =
        startDate && endDate
          ? { $gte: startDate, $lte: endDate }
          : this.getDefaultDateRange(filter);

      console.log("Date filter:", dateFilter);

      // Execute all queries in parallel for better performance
      const [
        pendingApprovals,
        topPatients,
        recentBookings,
        platformFreeTotal
      ] = await Promise.all([
        this.repository.getPendingApprovals(),
        this.repository.getTopPatients(dateFilter, doctorId),
        this.repository.getRecentBookings(dateFilter, doctorId),
        this.repository.getPlatformFreeTotal(dateFilter, doctorId)
      ]);

      return {
        pendingApprovals,
        topPatients,
        recentBookings,
        platformFreeTotal
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
