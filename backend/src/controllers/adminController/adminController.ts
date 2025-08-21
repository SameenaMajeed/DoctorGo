import { Request, Response } from "express";

import { IAdminService } from "../../interfaces/admin/adminServiceInterface";

import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";

import { sendResponse, sendError } from "../../utils/responseUtils";
import { CookieManager } from "../../utils/cookieManager";
import { AppError } from "../../utils/AppError";

class AdminController {
  constructor(private _adminService: IAdminService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );
      }

      const { admin, accessToken, refreshToken } =
        await this._adminService.adminLogin(email, password);
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        admin,
        email,
        accessToken,
      });
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.Unauthorized,
        MessageConstants.LOGIN_FAILED || error.message
      );
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      CookieManager.clearAuthCookies(res);
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGOUT_SUCCESS);
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getPendingDoctor(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = (req.query.searchTerm as string) || "";

      const { doctors, total } = await this._adminService.getPendingDoctors(
        page,
        limit,
        searchTerm
      );

      sendResponse(res, HttpStatus.OK, MessageConstants.PENDING_DOCTORS, {
        doctors,
        total,
        page,
        limit,
      });
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateDoctorVerificationStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { doctorId, status, notes } = req.body;
      console.log(req.body);

      if (!["approved", "rejected"].includes(status)) {
        sendError(res, HttpStatus.BadRequest, "Invalid status");
        return;
      }

      const updatedDoctor =
        await this._adminService.updateDoctorVerificationStatus(
          doctorId,
          status,
          notes
        );

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.DOCTOR_VERIFICATION_STATUS_UPDATED,
        {
          updatedDoctor,
        }
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateDoctorStatus(req: Request, res: Response): Promise<void> {
    const { doctorId, isBlocked, blockReason } = req.body;

    // Validate block reason if blocking
    if (isBlocked && !blockReason) {
      sendError(
        res,
        HttpStatus.BadRequest,
        MessageConstants.BLOCK_REASON_REQUIRED
      );
      return;
    }

    try {
      const updatedDoctor = await this._adminService.updateDoctorStatus(
        doctorId,
        isBlocked,
        blockReason
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.DOCTOR_STATUS_UPDATED, {
        updatedDoctor,
      });
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      console.log("reached at refresh token on doctorside");

      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.REFRESH_TOKEN_REQUIRED
        );
        return;
      }
      const tokens = await this._adminService.refreshAccessToken(refreshToken);
      if (!tokens?.accessToken) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.INVALID_REFRESH_TOKEN
        );
        return;
      }
      res.cookie(
        "accessToken",
        tokens.accessToken,
        CookieManager.getCookieOptions()
      );
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.ACCESS_TOKEN_REFRESHED,
        { accessToken: tokens.accessToken }
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        error.message || MessageConstants.REFRESH_TOKEN_FAILED
      );
    }
  }

  async getAllDoctors(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = (req.query.searchTerm as string) || "";
      const isBlocked = (req.query.isBlocked as string) || "all";
      const { doctors, total } = await this._adminService.getAllDoctors(
        page,
        limit,
        searchTerm,
        isBlocked
      );

      sendResponse(res, HttpStatus.OK, MessageConstants.ALL_DOCTORS_RETRIEVED, {
        doctors,
        total,
        page,
        limit,
      });
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = (req.query.searchTerm as string) || "";
      const isBlocked = (req.query.isBlocked as string) || "all";
      const { users, total } = await this._adminService.getAllUsers(
        page,
        limit,
        searchTerm,
        isBlocked
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.ALL_USERS_RETRIEVED, {
        users,
        total,
        page,
        limit,
      });
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async blockDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, isBlocked } = req.body;
      if (!doctorId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.DOCTOR_ID_REQUIRED
        );
      }

      const updatedDoctor = await this._adminService.doctorBlock(
        doctorId,
        isBlocked
      );
      const message = isBlocked
        ? MessageConstants.DOCTOR_BLOCKED
        : MessageConstants.DOCTOR_BLOCKED;
      sendResponse(res, HttpStatus.OK, message, { updatedDoctor });
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, isBlocked } = req.body;
      if (!userId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.USER_ID_REQUIRED
        );
      }

      const updatedUser = await this._adminService.userBlock(userId, isBlocked);

      const message = isBlocked
        ? MessageConstants.USER_BLOCKED
        : MessageConstants.USER_UNBLOCKED;
      sendResponse(res, HttpStatus.OK, message, { updatedUser });
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }

  async fetchDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      console.log("doctorId ", doctorId);

      // Find doctor by ID
      const doctor = await this._adminService.getDoctorById(doctorId);
      console.log(doctor);

      if (!doctor) {
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.DOCTOR_NOT_FOUND
        );
      }

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.DOCTOR_FETCHED_SUCCESSFULLY,
        doctor
      );
    } catch (error : any) {
      console.error("Error fetching doctor:", error);
      sendError(res, HttpStatus.BadRequest, error.message);
      // res
      //   .status(HttpStatus.InternalServerError)
      //   .json({ message: "Internal server error" });
    }
  }
}

export default AdminController;
