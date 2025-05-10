import ReviewService from "../../services/commonService/ReviewService";
import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendError, sendResponse } from "../../utils/responseUtils";

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

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
          "Rating must be between 1 and 5"
        );
      }
      const review = await this.reviewService.addReview(
        doctor_id,
        userId,
        appointment_id,
        reviewText,
        rating
      );
      sendResponse(res, HttpStatus.OK, "Review submitted successfully", review);
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

      const updatedReview = await this.reviewService.updateReview(
        id,
        reviewData,
        userId
      );

      if (!updatedReview) {
        throw new AppError(HttpStatus.BadRequest, "Review not found");
      }

      sendResponse(
        res,
        HttpStatus.OK,
        "Review submitted successfully",
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
        throw new AppError(HttpStatus.BadRequest, "Doctor ID is required");
      }
      const reviews = await this.reviewService.getReviewsByDoctorId(doctorId);

      sendResponse(res, HttpStatus.OK, "Reviews fetched successfully", reviews);
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
          "Doctor ID and Appointment ID are required"
        );
      }

      // // Check if appointment exists and was completed
      // const appointment = await this.reviewService.checkAppointment(
      //   doctorId.toString(),
      //   userId,
      //   appointmentId.toString()
      // );

      // Check for existing review for this appointment
      const existingReview = await this.reviewService.findReviewByAppointment(
        appointmentId.toString()
      );

      sendResponse(res, HttpStatus.OK, "Review check completed", {
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
      const review = await this.reviewService.getReviewById(id);

      if (!review) {
        throw new AppError(HttpStatus.NotFound, "Review not found");
      }

      sendResponse(res, HttpStatus.OK, "Review fetched successfully", review);
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
