import { Request, Response } from "express";
import { NotificationService } from "../../services/commonService/NotificationService";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendError, sendResponse } from "../../utils/responseUtils";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId, recipientType } = req.query;
      if (!recipientId || !recipientType) {
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      }

      const notifications = await this.notificationService.getNotifications(
        recipientId as string,
        recipientType as string
      );
      
      sendResponse(res, HttpStatus.OK, "Notification fetched succesfully", {
        notifications,
      });
    } catch (error) {
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

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      console.log('notificationId:',notificationId)
      const notification =
        await this.notificationService.markNotificationAsRead(notificationId);
      if (!notification) {
        throw new AppError(HttpStatus.Unauthorized, "Notification not found");
      }
      sendResponse(res, HttpStatus.OK, "Booking check completed", {
        notification,
      });
    } catch (error) {
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
