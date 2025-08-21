import ReviewService from "../../services/commonService/ReviewService";
import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendError, sendResponse } from "../../utils/responseUtils";

export class ReviewController {
  constructor(private _reviewService: ReviewService) {}

  async addReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId)
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      //   const { doctorId } = req.params;

      const { doctor_id, appointment_id, reviewText, rating } = req.body;
      console.log(req.body);
      if (!doctor_id || !appointment_id || !rating) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );
      }
      if (rating < 1 || rating > 5) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.RATING_MUST_BE_BETWEEN_1_AND_5
        );
      }
      const review = await this._reviewService.addReview(
        doctor_id,
        userId,
        appointment_id,
        reviewText,
        rating
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.REVIEW_SUBMITTED, review);
    } catch (error: unknown) {
      console.error(
        "Review submission error:",
        error instanceof Error ? error.message : "Unknown error"
      );
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

  async updateReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reviewData = req.body;
      const userId = req.data?.id;

      if (!userId)
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );

      const updatedReview = await this._reviewService.updateReview(
        id,
        reviewData,
        userId
      );

      if (!updatedReview) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REVIEW_NOT_FOUND);
      }

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.REVIEW_SUBMITTED,
        updatedReview
      );
    } catch (error: any) {
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

  async getReview(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      console.log("Fetching reviews for doctor:", doctorId);
      if (!doctorId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.DOCTOR_ID_REQUIRED);
      }
      const reviews = await this._reviewService.getReviewsByDoctorId(doctorId);

      sendResponse(res, HttpStatus.OK, MessageConstants.REVIEW_FETCHED, reviews);
    } catch (error: unknown) {
      console.error(
        "Error fetching branch reviews:",
        error instanceof Error ? error.message : "Unknown error"
      );
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

  async checkReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const { appointmentId } = req.query;

      if (!userId) {
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      }

      if (!appointmentId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.DOCTOR_AND_APPOINTMENT_ID_REQUIRED
        );
      }

      // // Check if appointment exists and was completed
      // const appointment = await this.reviewService.checkAppointment(
      //   doctorId.toString(),
      //   userId,
      //   appointmentId.toString()
      // );

      // Check for existing review for this appointment
      const existingReview = await this._reviewService.findReviewByAppointment(
        appointmentId.toString()
      );

      sendResponse(res, HttpStatus.OK, MessageConstants.REVIEW_CKEKCED_COMPLETED, {
        existingReview,
        canReview: !existingReview,
      });
    } catch (error: unknown) {
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

  async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const review = await this._reviewService.getReviewById(id);

      if (!review) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.REVIEW_NOT_FOUND);
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.REVIEW_FETCHED, review);
    } catch (error: unknown) {
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
