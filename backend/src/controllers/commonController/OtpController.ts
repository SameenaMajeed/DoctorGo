import { Request, Response } from "express";
import IOtpService from "../../interfaces/otp/OtpServiceInterface";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendError, sendResponse } from "../../utils/responseUtils";

export class OtpController {
  constructor(private _otpService: IOtpService) {}

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.EMAIL_REQUIRED
        );
      }
      await this._otpService.sendOtp(email);
      sendResponse(res, HttpStatus.OK, MessageConstants.OTP_SEND);
    } catch (error) {
      console.error("Controller Error :", error);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.EMAIL_AND_OTP_REQUIRED
        );
      }

      const isOtpValid = await this._otpService.verifyOtp(email, otp);

      if (!isOtpValid) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_OTP);
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.OTP_VERIFIED);
    } catch (error) {
      console.error("Controller Error :", error);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.EMAIL_REQUIRED
        );
      }

      await this._otpService.resendOtp(email);
      sendResponse(res, HttpStatus.OK, MessageConstants.OTP_RESEND);
    } catch (error) {
      console.error("Controller Error :", error);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
