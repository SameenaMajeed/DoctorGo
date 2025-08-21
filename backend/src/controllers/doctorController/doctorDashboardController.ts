import { Request, Response } from "express";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendResponse, sendError } from "../../utils/responseUtils";
import { AppError } from "../../utils/AppError";
import { IDashboardService } from "../../interfaces/doctor/dashboardServiceInterface";
import { IDoctorService } from "../../interfaces/doctor/doctorServiceInterface";

export class DoctorDashboardController {
  constructor(
    // private doctorService: IDoctorService,
    private _dashboardService: IDashboardService // Inject dashboard service
  ) {}


  public async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.doctorId;

      if (!doctorId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.DOCTOR_ID_NOT_FOUND);
      }

      const stats = await this._dashboardService.getDashboardStats(doctorId);
      console.log('stats:',stats)

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.DASHBOARD_STATS_FETCHED,
        stats
      );
    } catch (error: any) {
      if (error.message === "Doctor not found") {
        sendError(res, HttpStatus.NotFound, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR,
          error.message
        );
      }
    }
  }
}
