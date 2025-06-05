import { Request, Response } from "express";
import { ChatService } from "../../services/commonService/chatService";
import { sendResponse, sendError } from "../../utils/responseUtils";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { AppError } from "../../utils/AppError";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async getDoctorsWhoMessaged(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (!req.data?.id || req.data.id !== userId) {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.UNAUTHORIZED);
      }
      const doctors = await this.chatService.getDoctorsWhoMessaged(userId);
      sendResponse(res, HttpStatus.OK, "All doctors fetched successfully", {
        doctors,
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
  // async getDoctorsWhoMessaged(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { userId } = req.params;

  //     if (!req.data?.id || req.data.id !== userId) {
  //       throw new AppError(HttpStatus.Forbidden, MessageConstants.UNAUTHORIZED);
  //     }
  //     const doctors = await this.chatService.getDoctorsWhoMessaged(userId);
  //     console.log('doctors ',doctors  )
  //     sendResponse(res, HttpStatus.OK, 'Doctors who messaged fetched successfully', { doctors });
  //   } catch (error) {
  //     if (error instanceof AppError) {
  //       sendError(res, error.status, error.message);
  //     } else {
  //       sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
  //     }
  //   }
  // }

  async getUsersWhoMessaged(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      console.log(doctorId);

      if (!req.data?.id || req.data.id !== doctorId) {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.UNAUTHORIZED);
      }

      const users = await this.chatService.getUsersWhoMessaged(doctorId);

      sendResponse(
        res,
        HttpStatus.OK,
        "Users who messaged fetched successfully",
        { users }
      );
      
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
