import { Request, Response } from "express";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendResponse, sendError } from "../../utils/responseUtils";
import { AppError } from "../../utils/AppError";
import { IAdminDashboardService } from "../../interfaces/admin/IAdminDashboardService";

type DashboardFilter = "daily" | "monthly" | "yearly";

export class AdminDashboardController {
  constructor(private _adminService: IAdminDashboardService) {}

  private validateDates(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && startDate > endDate) {
      throw new AppError(
        HttpStatus.BadRequest,
        "Start date must be before end date"
      );
    }
  }

  private validateFilter(filter: unknown): DashboardFilter {
    const validFilters: DashboardFilter[] = ["daily", "monthly", "yearly"];
    const filterValue = (filter as DashboardFilter) || "daily";
    
    if (!validFilters.includes(filterValue)) {
      throw new AppError(
        HttpStatus.BadRequest,
        "Invalid filter value. Must be 'daily', 'monthly', or 'yearly'"
      );
    }
    
    return filterValue;
  }

  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, filter, doctorId, bookingId } = req.query;

      // Authorization check
      if (!req.data?.role || req.data.role !== "admin") {
        throw new AppError(
          HttpStatus.Forbidden,
          MessageConstants.PERMISSION_DENIED
        );
      }

      // Validate inputs
       let startDateObj: Date | undefined;
       let endDateObj: Date | undefined;
      // const startDateObj = startDate ? new Date(startDate as string) : undefined;
      // const endDateObj = endDate ? new Date(endDate as string) : undefined;
      try {
      startDateObj = startDate ? new Date(startDate as string) : undefined;
      endDateObj = endDate ? new Date(endDate as string) : undefined;
    } catch (err) {
      throw new AppError(
        HttpStatus.BadRequest,
        "Invalid date format. Please use ISO format (YYYY-MM-DD)"
      );
    }

      this.validateDates(startDateObj, endDateObj);
      
      const filterValue = this.validateFilter(filter);

      const data = await this._adminService.getDashboardData(
        startDateObj,
        endDateObj,
        filterValue,
        doctorId as string,
        bookingId as string
      );

      sendResponse(
        res,
        HttpStatus.OK,
        "Dashboard data fetched successfully",
        data
      );
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error("Error in AdminDashboardController:", error);
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}