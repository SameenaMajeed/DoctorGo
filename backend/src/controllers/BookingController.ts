import { Request, Response } from "express";
import { IBookingService } from "../interfaces/Booking/BookingServiceInterface";
import { IPaymentService } from "../interfaces/Payment/PaymentServiceInterface";
import { AppError } from "../utils/AppError";
import { sendError, sendResponse } from "../utils/responseUtils";
import { MessageConstants } from "../constants/MessageConstants";
import { AppointmentStatus } from "../models/BookingModel";
import { HttpStatus } from "../constants/Httpstatus";

export class BookingController {
  constructor(
    private bookingService: IBookingService,
    private paymentService: IPaymentService
  ) {}

  private handleError(res: Response, error: unknown): void {
    console.error("Error:", error);
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

  // user Booking details:

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency, appointmentData } = req.body;

      if (!amount || !currency || !appointmentData) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );
      }

      // Create Razorpay order
      const order = await this.paymentService.createOrder(amount, currency);

      // Prepare response with Razorpay options
      const response = {
        success: true,
        paymentOptions: {
          key: process.env.RAZORPAY_KEY_ID, // Your Razorpay key
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: "Doctor Go",
          description: `Appointment with Dr. ${appointmentData.doctorId}`,
          prefill: {
            name: appointmentData.patientName,
            contact: appointmentData.contactNumber,
            email: "patient@example.com", // You might want to get this from user data
          },
          theme: {
            color: "#3399cc",
          },
        },
        appointmentData, // Include this for verification later
      };

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.PAYMENT_ORDER_CREATED,
        response
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId, orderId, signature } = req.body;
      if (!paymentId || !orderId || !signature) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );
      }

      const isVerified = await this.paymentService.verifyPayment(
        paymentId,
        orderId,
        signature
      );
      if (!isVerified) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.PAYMENT_VERIFICATION_FAILED
        );
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.PAYMENT_VERIFIED);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;

      if (!userId)
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );

      const { paymentId, ...bookingDetails } = req.body;
      console.log()

      if (!paymentId) {
        throw new AppError(
          HttpStatus.BadRequest,
          "Payment ID is required for booking."
        );
      }

      const bookingData = {
        ...bookingDetails,
        is_paid: true, // Mark as paid
        paymentMethod: "razorpay",
        paymentId, // Razorpay payment ID
      };

      const booking = await this.bookingService.bookAppointment(bookingData);
      console.log('booking:' ,booking)

      sendResponse(
        res,
        HttpStatus.Created,
        MessageConstants.APPOINTMENT_CREATED,
        booking
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id)
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );

      const bookings = await this.bookingService.getAppointments(id);
      if (!bookings.length)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.APPOINTMENT_FETCHED,
        bookings
      ); // Send array
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      console.log("request hitting");
      const { id } = req.params;
      console.log("id: ", id);
      if (!id)
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );

      const booking = await this.bookingService.cancelAppointment(id);
      if (!booking)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.APPOINTMENT_CANCELLED,
        booking
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // doctor Booking details:
  async getDoctorBooking(req: Request, res: Response): Promise<void> {
    console.log("Request hitting...");
    try {
      const { doctorId } = req.params;
      const authenticatedDoctorId = req.data?.id;

      if (!doctorId || doctorId !== authenticatedDoctorId) {
        throw new AppError(
          HttpStatus.Forbidden,
          MessageConstants.PERMISSION_DENIED
        );
      }

      const { page = "1", limit = "10", status } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const result = await this.bookingService.getDoctorAppointments(
        doctorId,
        pageNum,
        limitNum,
        status as AppointmentStatus | undefined
      );
      

      sendResponse(res, HttpStatus.OK, MessageConstants.APPOINTMENT_FETCHED, {
        bookings: result.appointment,
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateDoctorAppointmentStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { appointmentId } = req.params;
      console.log(appointmentId);
      const { status } = req.body;
      console.log(status);
      const doctorId = req.data?.id;
      console.log(doctorId);

      if (!doctorId)
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );
      if (!appointmentId || !status)
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );

      const appointment =
        await this.bookingService.updateDoctorAppointmentStatus(
          appointmentId,
          doctorId,
          status
        );
      if (!appointment)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );
      sendResponse(
        res,
        HttpStatus.OK,
        `Appoinment updated to ${status} successfully`,
        appointment
      );
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

  public async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { doctorId } = req.query;

      const bookings = await this.bookingService.getUserBookings(
        userId,
        doctorId as string
      );
      sendResponse(
        res,
        HttpStatus.OK,
        "User bookings fetched successfully",
        bookings
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

  public async checkUserBooking(req: Request, res: Response): Promise<void> {
    try {
      const { userId, slotId } = req.query;

      const hasBooking = await this.bookingService.checkUserBooking(
        userId as string,
        slotId as string
      );

      sendResponse(res, HttpStatus.OK, "Booking check completed", {
        hasBooking,
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

  // get user data for the perticular doctor:

  // async getPatients(req: Request, res: Response): Promise<void> {
  //   try {
  //     const userId = req.data?.id;
  //     if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
  //     const { page = '1', limit = '10', status } = req.query;
  //     const pageNum = parseInt(page as string, 10);
  //     const limitNum = parseInt(limit as string, 10);
  //     const result = await this._reservationService.getUserReservationsWithPagination(
  //       userId,
  //       pageNum,
  //       limitNum,
  //       status as ReservationStatus | undefined
  //     );
  //     sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATIONS_FETCHED, {
  //       reservations: result.reservations,
  //       total: result.total,
  //       page: pageNum,
  //       limit: limitNum,
  //       totalPages: Math.ceil(result.total / limitNum),
  //     });
  //   } catch (error: unknown) {
  //     console.error('Error fetching user reservations:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
  //     if (error instanceof AppError) {
  //       sendError(res, error.status, error.message);
  //     } else {
  //       sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
  //     }
  //   }
  // }

  async getPatients(req: Request, res: Response) {
    try {
      const doctorId = req.params.doctorId;
      console.log(doctorId)
      const patients = await this.bookingService.getPatientsForDoctor(doctorId);
      console.log('patients :' ,patients)
      sendResponse(res, HttpStatus.OK, "Booked Users Populated successfully", {
        patients,
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
