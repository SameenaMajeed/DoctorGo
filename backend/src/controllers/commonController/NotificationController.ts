import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendError, sendResponse } from "../../utils/responseUtils";
import { INotificationServiceInterface } from "../../interfaces/Notification/INotificationServiceInterface";

export class NotificationController {
  constructor(private _notificationService: INotificationServiceInterface) {}
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId, recipientType } = req.query;
      if (!recipientId || !recipientType) {
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      }

      const notifications = await this._notificationService.getNotifications(
        recipientId as string,
        recipientType as string
      );

      sendResponse(res, HttpStatus.OK, MessageConstants.NOTIFICATION_FETCHED, {
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
      console.log("notificationId:", notificationId);
      const notification =
        await this._notificationService.markNotificationAsRead(notificationId);
      if (!notification) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.NOTIFICATION_NOT_FOUND);
      }
      sendResponse(res, HttpStatus.OK, MessageConstants.MARK_AS_READ, {
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

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { recipientId, recipientType } = req.body;

      if (!recipientId || !recipientType) {
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      }

      const result = await this._notificationService.markAllNotificationsAsRead(
        recipientId,
        recipientType
      );

      sendResponse(res, HttpStatus.OK, MessageConstants.MARK_ALL_AS_READ, {
        result,
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

  async clearAllNotifications(req: Request, res: Response): Promise<void> {
    try {
    const { recipientId, recipientType } = req.body

    if (!recipientId || !recipientType) {
      throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      }
      const result = await this._notificationService.clearAllNotifications(recipientId, recipientType)

      sendResponse(res, HttpStatus.OK, MessageConstants.ALL_NOTIFICATION_CLEARED, {
        result,
      });

    }catch (error) {
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

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
    const { notificationId} = req.body

    if ( notificationId ) {
      throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      }
      const result = await this._notificationService.deleteNotification(notificationId )

      sendResponse(res, HttpStatus.OK, MessageConstants.NOTIFICATION_DELETED, {
        result,
      });

    }catch (error) {
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
