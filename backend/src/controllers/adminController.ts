import { Request, Response } from "express";

import { IAdminService } from "../interfaces/admin/adminServiceInterface";

import { HttpStatus } from "../constants/Httpstatus";
import { MessageConstants } from "../constants/MessageConstants";

import { sendResponse, sendError } from "../utils/responseUtils";
import { CookieManager } from "../utils/cookieManager";

class AdminController {
  constructor(private adminService: IAdminService) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      const { admin, accessToken, refreshToken } =
        await this.adminService.adminLogin(email, password);
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        admin,
        email,
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

      const { doctors, total } = await this.adminService.getPendingDoctors(
        page,
        limit,
        searchTerm
      );

      sendResponse(
        res,
        HttpStatus.OK,
        "Pending doctors retrieved successfully",
        {
          doctors,
          total,
          page,
          limit,
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
      sendError(res, HttpStatus.BadRequest, "Block reason is required.");
      return;
    }

    try {
      const updatedDoctor = await this.adminService.updateDoctorStatus(
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
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.REFRESH_TOKEN_REQUIRED
        );
        return;
      }
      const tokens = await this.adminService.refreshAccessToken(refreshToken);
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
      const { doctors, total } = await this.adminService.getAllDoctors(
        page,
        limit,
        searchTerm,
        isBlocked
      );

      sendResponse(res, HttpStatus.OK, "retrieved successfully", {
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
      const { users, total } = await this.adminService.getAllUsers(
        page,
        limit,
        searchTerm,
        isBlocked
      );
      sendResponse(res, HttpStatus.OK, "Users retrieved successfully", {
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
    const { doctorId, isBlocked } = req.body;
    try {
      const updatedRestaurent = await this.adminService.doctorBlock(
        doctorId,
        isBlocked
      );
      const message = isBlocked
        ? MessageConstants.DOCTOR_BLOCKED
        : MessageConstants.DOCTOR_BLOCKED;
      sendResponse(res, HttpStatus.OK, message, { updatedRestaurent });
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    const { userId, isBlocked } = req.body;
    try {
      const updatedUser = await this.adminService.userBlock(userId, isBlocked);
      
      const message = isBlocked
        ? MessageConstants.USER_BLOCKED
        : MessageConstants.USER_UNBLOCKED;
      sendResponse(res, HttpStatus.OK, message, { updatedUser });
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }
}

export default AdminController;
