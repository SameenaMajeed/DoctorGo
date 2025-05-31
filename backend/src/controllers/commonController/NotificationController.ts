// import { Request, Response } from "express";
// import { NotificationService } from "../../services/commonService/NotificationService";
// import { sendResponse, sendError } from "../../utils/responseUtils";
// import { HttpStatus } from "../../constants/Httpstatus";
// import { MessageConstants } from "../../constants/MessageConstants";
// import { AppError } from "../../utils/AppError";
// import { NotificationRepository } from "../../repositories/commonRepository/NotificationRepository";

// export class NotificationController {
//   private notificationService: NotificationService;

//   constructor() {
//     const notificationRepo = new NotificationRepository();
//     this.notificationService = new NotificationService(notificationRepo);
//   }

//   async getUserNotifications(req: Request, res: Response): Promise<void> {
//     try {
//       const userId = req.data?.id;
//       if (!userId) {
//         throw new AppError(HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
//       }

//       const userType = req.path.startsWith('/api/users') ? 'user' : 'doctor';
//       const notifications = await this.notificationService.getUserNotifications(userId, userType);

//       sendResponse(res, HttpStatus.OK, "User notifications fetched successfully", { notifications });
//     } catch (error) {
//       if (error instanceof AppError) {
//         sendError(res, error.status, error.message);
//       } else {
//         sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
//       }
//     }
//   }

//   async getUnreadCount(req: Request, res: Response): Promise<void> {
//     try {
//       const userId = req.data?.id;
//       if (!userId) {
//         throw new AppError(HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
//       }

//       const count = await this.notificationService.getUnreadCount(userId);

//       sendResponse(res, HttpStatus.OK, "Unread count fetched successfully", { count });
//     } catch (error) {
//       if (error instanceof AppError) {
//         sendError(res, error.status, error.message);
//       } else {
//         sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
//       }
//     }
//   }

//   async markAsRead(req: Request, res: Response): Promise<void> {
//     try {
//       const { notificationId } = req.params;
//       const notification = await this.notificationService.markAsRead(notificationId);

//       if (!notification) {
//         throw new AppError(HttpStatus.NotFound, MessageConstants.NOTIFICATION_NOT_FOUND);
//       }

//       sendResponse(res, HttpStatus.OK, "Notification marked as read", { notification });
//     } catch (error) {
//       if (error instanceof AppError) {
//         sendError(res, error.status, error.message);
//       } else {
//         sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
//       }
//     }
//   }

//   async markAllAsRead(req: Request, res: Response): Promise<void> {
//     try {
//       const userId = req.data?.id;
//       if (!userId) {
//         throw new AppError(HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
//       }

//       const count = await this.notificationService.markAllAsRead(userId);

//       sendResponse(res, HttpStatus.OK, "All notifications marked as read", { count });
//     } catch (error) {
//       if (error instanceof AppError) {
//         sendError(res, error.status, error.message);
//       } else {
//         sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
//       }
//     }
//   }
// }
