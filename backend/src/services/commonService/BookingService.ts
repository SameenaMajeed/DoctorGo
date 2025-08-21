import mongoose, { Types, UpdateQuery } from "mongoose";
import { IBookingService } from "../../interfaces/Booking/BookingServiceInterface";
import { IBookingRepository } from "../../interfaces/Booking/BookingRepositoryInterface";
import {
  AppointmentStatus,
  IBooking,
} from "../../models/commonModel/BookingModel";
import { MessageConstants } from "../../constants/MessageConstants";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { IDoctorRepository } from "../../interfaces/doctor/doctorRepositoryInterface";
import { IUserRepositoryInterface } from "../../interfaces/user/UserRepositoryInterface";
import { ISlotRepository } from "../../interfaces/Slot/SlotRepositoryInterface";
import { ISlot } from "../../models/commonModel/SlotModel";
import { sentMail } from "../../utils/SendMail";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { io } from "../../server";
import { INotificationRepository } from "../../interfaces/Notification/INotificationRepositoryInterface";
import { IWalletRepositoryInterface } from "../../interfaces/wallet/IWalletRepositoryInterface";
// import { IUser } from "../../models/userModel/userModel";

export class BookingService implements IBookingService {
  constructor(
    private _bookingRepo: IBookingRepository,
    private _doctorRepo: IDoctorRepository,
    private _patientRepo: IUserRepositoryInterface,
    private _slotRepo: ISlotRepository,
    private _notificationRepo: INotificationRepository,
    private _walletRepo: IWalletRepositoryInterface
  ) {}

  // Send email with video call room ID
  async sendVideoCallEmail(
    bookingId: string,
    roomId: string,
    userId: string
  ): Promise<void> {
    try {
      const booking = await this._bookingRepo.findById(bookingId);
      if (!booking) {
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );
      }

      const user = await this._patientRepo.findById(userId);
      if (!user) {
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.INVALID_PATIENT
        );
      }

      const subject = "Video Call Appointment Details";
      const html = `
        <h3>Your Online Appointment</h3>
        <p>Your appointment with Dr. ${booking.doctor_id} is scheduled.</p>
        <p><strong>Room ID:</strong> ${roomId}</p>
        <p>Please use this Room ID to join the video call at the scheduled time: ${
          booking.appointmentTime
        } on ${booking.appointmentDate.toDateString()}.</p>
        <p><a href="${
          process.env.CLIENT_URL
        }/video-call?roomId=${roomId}&bookingId=${bookingId}">Join Video Call</a></p>
      `;

      const emailSent = await sentMail(user.email, subject, html);
      if (!emailSent) {
        throw new AppError(
          HttpStatus.InternalServerError,
          "Failed to send video call email"
        );
      }
    } catch (error) {
      console.error("Error sending video call email:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        "Failed to send video call email"
      );
    }
  }

  async createVideoCallRoom(
    bookingId: string,
    doctorId: string,
    io: Server
  ): Promise<{ roomId: string; booking: IBooking }> {
    const booking = await this._bookingRepo.findById(bookingId);
    if (!booking)
      throw new AppError(
        HttpStatus.NotFound,
        MessageConstants.BOOKING_NOT_FOUND
      );

    if (booking.doctor_id._id.toString() !== doctorId) {
      throw new AppError(
        HttpStatus.Forbidden,
        "Unauthorized: Doctor ID does not match"
      );
    }

    if (
      booking.modeOfAppointment !== "online" ||
      booking.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new AppError(
        HttpStatus.BadRequest,
        "Invalid booking for video call"
      );
    }

    const roomId = uuidv4();
    const updatedBooking = await this._bookingRepo.update(bookingId, {
      videoCallRoomId: roomId,
    });

    if (!updatedBooking) {
      throw new AppError(
        HttpStatus.InternalServerError,
        "Failed to update booking with room ID"
      );
    }

    // Emit to sockets
    io.to(`doctor_${doctorId}`).emit("videoCallRoomCreated", {
      bookingId,
      roomId,
      role: "doctor", // Explicitly set role
    });
    // Emit to user's room
    io.to(`user_${updatedBooking.user_id}`).emit("videoCallRoomAssigned", {
      bookingId,
      roomId,
      role: "user", // Explicitly set role
    });

    // await this._notificationRepo.createNotification({
    //   recipientId: updatedBooking.user_id.toString(),
    //   recipientType: "user",
    //   message: "Your video call room has been created.",
    //   title: "Vedio call",
    //   metadata: { link: `/video-call/${roomId}` },
    //   type: "info",
    // });

    // // 🔔 Emit notification to user
    // io.to(`user_${updatedBooking.user_id}`).emit("sendNotification", {
    //   recipientId: updatedBooking.user_id,
    //   recipientRole: "user",
    //   type: "info",
    //   message: "Your video call room has been created. Please join on time.",
    //   link: `/video-call/${roomId}`,
    // });

    // await this._notificationRepo.createNotification({
    //   recipientId: updatedBooking.user_id.toString(),
    //   recipientType: "doctor",
    //   message: "A video call room has been created for your appointment.",
    //   title: "Vedio call",
    //   metadata: { link: `/video-call/${roomId}` },
    //   type: "info",
    // });

    // // 🔔 Emit notification to doctor
    // io.to(`doctor_${doctorId}`).emit("sendNotification", {
    //   recipientId: doctorId,
    //   recipientRole: "doctor",
    //   type: "info",
    //   message: "A video call room has been created for your appointment.",
    //   link: `/video-call/${roomId}`,
    // });

    // Optional: Catch email errors silently
    try {
      await this.sendVideoCallEmail(
        bookingId,
        roomId,
        updatedBooking.user_id.toString()
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return { roomId, booking: updatedBooking };
  }

  // user side
  async bookAppointment(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const doctorId = new Types.ObjectId(bookingData.doctor_id);
      const patientId = new Types.ObjectId(bookingData.user_id);
      const slotId = new Types.ObjectId(bookingData.slot_id);

      // Validate required fields
      if (
        !doctorId ||
        !patientId ||
        !slotId ||
        !bookingData.appointmentDate ||
        !bookingData.appointmentTime
      ) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );
      }

      // // Check if user already has a booking for this slot
      // const existingBooking = await this._bookingRepo.findOne({
      //   user_id: patientId,
      //   slot_id: slotId,
      //   status: { $ne: AppointmentStatus.CANCELLED }, // Don't count cancelled appointments
      // });

      // if (existingBooking) {
      //   throw new AppError(
      //     HttpStatus.BadRequest,
      //     "You already have an appointment booked for this time slot."
      //   );
      // }

      const doctor = await this._doctorRepo.findById(doctorId.toString());
      if (!doctor)
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.INVALID_DOCTOR
        );

      const patient = await this._patientRepo.findById(patientId.toString());
      if (!patient)
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.INVALID_PATIENT
        );

      // Handle wallet payment deduction if payment method is wallet
      if (bookingData.paymentMethod === "wallet") {
        if (!bookingData.totalAmount) {
          throw new AppError(
            HttpStatus.BadRequest,
            "Total amount is required for wallet payment"
          );
        }

        const wallet = await this._walletRepo.getWalletByUserId(
          patientId.toString()
        );

        if (!wallet || wallet.balance < bookingData.totalAmount) {
          throw new AppError(
            HttpStatus.BadRequest,
            "Insufficient wallet balance"
          );
        }

        // Deduct amount from wallet
        await this._walletRepo.deductAmount(
          patientId.toString(),
          bookingData.totalAmount,
          `Payment for appointment with Dr. ${doctor.name}`,
          bookingData._id?.toString()
        );
      }

      await this._slotRepo.updateSlot(slotId.toString(), {
        $inc: { bookedCount: 1 },
      } as UpdateQuery<ISlot>);

      // Create booking
      const booking = await this._bookingRepo.create({
        ...bookingData,
        doctor_id: doctorId,
        user_id: patientId,
        slot_id: slotId,
        is_paid:
          bookingData.paymentMethod === "wallet" ? true : bookingData.is_paid,
        paymentMethod: bookingData.paymentMethod || "razorpay",
        status: AppointmentStatus.CONFIRMED,
      });

      console.log("booking from service", booking);

      // Save and emit patient notification using repository
      const patientNotification =
        await this._notificationRepo.createNotification({
          recipientId: patientId.toString(),
          recipientType: "user",
          type: "BOOKING_CONFIRMED",
          title: "Booking Confirmed",
          message: "Appointment confirmed!",
          metadata: { link: "/appointments" },
        });

      io.to(`user_${patientId}`).emit("receiveNotification", {
        title: patientNotification.title,
        message: patientNotification.message,
        type: patientNotification.type,
        link: patientNotification.link,
        timestamp: patientNotification.createdAt,
      });

      // Save and emit doctor notification using repository
      const doctorNotification =
        await this._notificationRepo.createNotification({
          recipientId: doctorId.toString(),
          recipientType: "doctor",
          type: "NEW_BOOKING_REQUEST",
          title: "New Booking Request",
          message: `New appointment booked by ${patient.name}`,
          metadata: { link: "/doctor/appointments" },
        });

      io.to(`doctor_${doctorId}`).emit("receiveNotification", {
        title: doctorNotification.title,
        message: doctorNotification.message,
        type: doctorNotification.type,
        link: doctorNotification.link,
        timestamp: doctorNotification.createdAt,
      });

      return booking;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAppointments(id: string): Promise<IBooking[]> {
    // Return an array
    try {
      const bookings = await this._bookingRepo.findByUserId(id);

      if (!bookings.length)
        // Check if any records exist
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );

      // // Exclude cancelled appointments
      // const filteredBookings = bookings.filter(
      //   (booking) => booking.status !== "cancelled"
      // );

      // if (!filteredBookings.length)
      //   throw new AppError(HttpStatus.NotFound, "No active appointments found");

      return bookings;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cancelAppointment(id: string): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await this._bookingRepo.findById(id);
      if (!booking)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );

      if (booking.status === AppointmentStatus.CANCELLED)
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.BOOKING_ALREADY_CANCELLED
        );

      const updatedBooking = await this._bookingRepo.updateStatus(
        id,
        AppointmentStatus.CANCELLED
      );

      if (!updatedBooking)
        throw new AppError(
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );

      const updatedSlot = await this._slotRepo.decrementBookedCount(
        updatedBooking.slot_id.toString()
      );

      if (!updatedSlot)
        throw new AppError(
          HttpStatus.InternalServerError,
          "Failed to update slot patient count"
        );

      const populatedBooking = await this._bookingRepo.findById(id);

      if (!populatedBooking)
        throw new AppError(
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );

      // Patient notification about cancellation
      const patientNotification =
        await this._notificationRepo.createNotification({
          recipientId: updatedBooking.user_id._id.toString(),
          recipientType: "user",
          type: "APPOINTMENT_CANCELLED",
          title: "Appointment Cancelled",
          message: `Your appointment #${updatedBooking._id} has been cancelled`,
          metadata: { link: "/user/appointments" },
        });

      // Doctor notification about cancellation
      const doctorNotification =
        await this._notificationRepo.createNotification({
          recipientId: updatedBooking.doctor_id._id.toString(),
          recipientType: "doctor",
          type: "APPOINTMENT_CANCELLED",
          title: "Appointment Cancelled",
          message: `Appointment #${updatedBooking._id} has been cancelled`,
          metadata: { link: "/doctor/appointments" },
        });

      // Emit real-time notifications
      io.to(`patient_${updatedBooking.user_id._id}`).emit(
        "receiveNotification",
        {
          title: patientNotification.title,
          message: patientNotification.message,
          type: patientNotification.type,
          link: patientNotification.link,
          timestamp: patientNotification.createdAt,
        }
      );

      io.to(`doctor_${updatedBooking.doctor_id._id}`).emit("receiveNotification", {
        title: doctorNotification.title,
        message: doctorNotification.message,
        type: doctorNotification.type,
        link: doctorNotification.link,
        timestamp: doctorNotification.createdAt
      });

      // If payment was made, refund to wallet
      if (updatedBooking.is_paid) {
        const wallet = await this._walletRepo.addCredit(
          updatedBooking.user_id.toString(),
          updatedBooking.ticketPrice,
          `Refund for cancelled booking #${updatedBooking._id}`,
          updatedBooking._id.toString()
        );
      }

      // Refund notification
      const refundNotification =
        await this._notificationRepo.createNotification({
          recipientId: updatedBooking.user_id._id.toString(),
          recipientType: "user",
          type: "WALLET_REFUND",
          title: "Refund Processed",
          message: `Amount of ${updatedBooking.ticketPrice} has been credited to your wallet for cancelled booking`,
          metadata: { link: "/wallet" },
        });

      io.to(`patient_${updatedBooking.user_id._id}`).emit(
        "receiveNotification",
        {
          title: refundNotification.title,
          message: refundNotification.message,
          type: refundNotification.type,
          link: refundNotification.link,
          timestamp: refundNotification.createdAt,
        }
      );

      await session.commitTransaction();
      return updatedBooking;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    } finally {
      session.endSession();
    }
  }

  async confirmAppointment(id: string, paymentId: string): Promise<IBooking> {
    try {
      console.log("Booking ID:", id);

      const booking = await this._bookingRepo.findById(id);
      if (!booking)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );

      if (
        booking.status !== AppointmentStatus.PENDING &&
        booking.status !== AppointmentStatus.PAYMENT_FAILED
      ) {
        throw new AppError(
          HttpStatus.BadRequest,
          `${MessageConstants.INVALID_BOOKING_STATUS}: ${booking.status}`
        );
      }

      const updatedBooking = await this._bookingRepo.update(id, {
        status: AppointmentStatus.PENDING,
        paymentId,
        paymentMethod: "razorpay",
      });

      if (!updatedBooking)
        throw new AppError(
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );

      return updatedBooking;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async failAppointment(id: string, paymentId: string): Promise<IBooking> {
    try {
      const booking = await this._bookingRepo.findById(id);
      if (!booking)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );

      if (booking.status !== AppointmentStatus.PENDING) {
        throw new AppError(
          HttpStatus.BadRequest,
          `${MessageConstants.INVALID_BOOKING_STATUS}: ${booking.status}`
        );
      }

      const updatedBooking = await this._bookingRepo.update(id, {
        status: AppointmentStatus.PAYMENT_FAILED,
        paymentId,
      });

      if (!updatedBooking)
        throw new AppError(
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );

      return updatedBooking;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createFailedBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      
      const doctorId = new Types.ObjectId(bookingData.doctor_id);
      const patientId = new Types.ObjectId(bookingData.user_id);
      const slotId = new Types.ObjectId(bookingData.slot_id);

      // Validate required fields
      if (!doctorId || !patientId || !slotId) {
        throw new AppError(HttpStatus.BadRequest, "Required fields missing");
      }

      // Create the failed booking
      const booking = await this._bookingRepo.create({
        ...bookingData,
        doctor_id: doctorId,
        user_id: patientId,
        slot_id: slotId,
        is_paid: false,
        status: bookingData.status,
      });

      // Send notification to user
      const notification = await this._notificationRepo.createNotification({
        recipientId: patientId.toString(),
        recipientType: "user",
        type: "PAYMENT_FAILED",
        title: "Payment Failed",
        message: "Your appointment payment failed. Please try again.",
        metadata: { link: "/appointments" },
      });

      io.to(`user_${patientId}`).emit("receiveNotification", {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        timestamp: notification.createdAt,
      });

      return booking;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        "Internal server error"
      );
    }
  }

  // doctors side
  async getAvailableDoctors(
    doctorId: string,
    appointmentDate: Date,
    appointmentTime: string
  ): Promise<any[]> {
    try {
      const AllDoctors = await this._doctorRepo.findAllDoctor();

      const availabilityPromises = AllDoctors.map(async (doctor) => {
        const existingDoctor = await this._bookingRepo.findAvailability(
          doctorId,
          doctor._id.toString(),
          appointmentDate,
          appointmentTime
        );
        return existingDoctor < (doctor.isApproved ? 1 : 0) ? doctor : null;
      });
      return (await Promise.all(availabilityPromises)).filter(
        (doctor) => doctor !== null
      );
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserAppointmentWithPagination(
    userId: string,
    page: number,
    limit: number,
    status?: AppointmentStatus
  ): Promise<{ appointment: IBooking[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [appointment, total] = await Promise.all([
        this._bookingRepo.findByUserIdWithPagination(
          userId,
          skip,
          limit,
          status
        ),
        this._bookingRepo.countByUserId(userId, status),
      ]);
      return { appointment, total };
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDoctorAppointments(
    doctorID: string,
    page: number,
    limit: number,
    status?: AppointmentStatus
  ): Promise<{ appointment: IBooking[]; total: number }> {
    try {
      const doctor = await this._bookingRepo.findByDoctorId(doctorID);
      if (!doctor)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.DOCTOR_NOT_FOUND
        );

      const skip = (page - 1) * limit;
      const [appointment, total] = await Promise.all([
        this._bookingRepo.findByDoctorIdWithPagination(
          doctorID,
          skip,
          limit,
          status
        ),
        this._bookingRepo.countByDoctorId(doctorID, status),
      ]);

      return { appointment, total };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateDoctorAppointmentStatus(
    appointmentID: string,
    doctorID: string,
    status: "confirmed" | "completed" | "cancelled"
  ): Promise<IBooking | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log(
        `Starting appointment update - ID: ${appointmentID}, Status: ${status}, Doctor: ${doctorID}`
      );

      const appointment = await this._bookingRepo.findById(appointmentID);
      if (!appointment)
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.BOOKING_NOT_FOUND
        );

      if (appointment.doctor_id._id.toString() !== doctorID) {
        throw new AppError(
          HttpStatus.Forbidden,
          MessageConstants.PERMISSION_DENIED
        );
      }

      // Define valid status transitions
      const validTransitions: Record<string, AppointmentStatus[]> = {
        [AppointmentStatus.PENDING]: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.CANCELLED,
        ],
        [AppointmentStatus.CONFIRMED]: [
          AppointmentStatus.COMPLETED,
          AppointmentStatus.CANCELLED,
        ],
      };

      if (
        !validTransitions[appointment.status]?.includes(
          status as AppointmentStatus
        )
      ) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.INVALID_BOOKING_STATUS
        );
      }

      // Map status to the enum
      const mappedStatus =
        status === "confirmed"
          ? AppointmentStatus.CONFIRMED
          : status === "completed"
          ? AppointmentStatus.COMPLETED
          : AppointmentStatus.CANCELLED;

      const updatedAppointment = await this._bookingRepo.update(appointmentID, {
        status: mappedStatus,
      });

      if (!updatedAppointment)
        throw new AppError(
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );

      await session.commitTransaction();

      // Save and emit patient notification using repository
      const patientNotification =
        await this._notificationRepo.createNotification({
          recipientId: appointment.user_id.toString(),
          recipientType: "user",
          type: "UPDATE_STATUS",
          title: "Status Updated",
          message: `Your appointment has been ${status}.`,
          metadata: { link: "/appointments" },
        });

      io.to(`user_${appointment.user_id.toString()}`).emit(
        "receiveNotification",
        {
          title: patientNotification.title,
          message: patientNotification.message,
          type: patientNotification.type,
          link: patientNotification.link,
          timestamp: patientNotification.createdAt,
        }
      );
      return updatedAppointment;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    } finally {
      session.endSession();
    }
  }

  public async getUserBookings(
    userId: string,
    doctorId?: string
  ): Promise<IBooking[]> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const doctorIdObj = doctorId ? new Types.ObjectId(doctorId) : undefined;

      return await this._bookingRepo.findByUserSlotId(userIdObj, doctorIdObj);
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        "Failed to fetch user bookings"
      );
    }
  }

  public async checkUserBooking(
    userId: string,
    slotId: string
  ): Promise<boolean> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const slotIdObj = new Types.ObjectId(slotId);

      const existingBooking = await this._bookingRepo.findOneByUserAndSlot(
        userIdObj,
        slotIdObj
      );
      return !!existingBooking;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        "Failed to check user booking"
      );
    }
  }

  // get user data for a perticular doctor:
  async getPatientsForDoctor(
    doctorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ patients: IBooking[]; total: number }> {
    const { patients, total } = await this._bookingRepo.getPatientsForDoctor(
      doctorId,
      page,
      limit
    );
    return { patients, total };
  }

  async getAllBookings(
    page: number = 1,
    limit: number = 10,
    status?: AppointmentStatus
  ): Promise<{ bookings: IBooking[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const { bookings, total } =
        await this._bookingRepo.findAllBookingsWithPagination(
          skip,
          limit,
          status
        );

      return {
        bookings,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getTodaysAppointments(doctorId: string): Promise<IBooking[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Pass doctorId and date range
    return this._bookingRepo.findTodaysAppointments(
      doctorId,
      startOfDay,
      endOfDay
    );
  }

   async getAllDoctorsRevenue() : Promise<any[]>{
    return this._bookingRepo.getDoctorsRevenue();
  }

  async getDoctorRevenue(doctorId: string): Promise<number> {
    return await this._bookingRepo.getEachDoctorRevenue(doctorId);
  }
}

// import mongoose, { Types, UpdateQuery } from "mongoose";
// import { IBookingService } from "../../interfaces/Booking/BookingServiceInterface";
// import { IBookingRepository } from "../../interfaces/Booking/BookingRepositoryInterface";
// import {
//   AppointmentStatus,
//   IBooking,
// } from "../../models/commonModel/BookingModel";
// import { MessageConstants } from "../../constants/MessageConstants";
// import { AppError } from "../../utils/AppError";
// import { HttpStatus } from "../../constants/Httpstatus";
// import { IDoctorRepository } from "../../interfaces/doctor/doctorRepositoryInterface";
// import { UserRepositoryInterface } from "../../interfaces/user/UserRepositoryInterface";
// import { ISlotRepository } from "../../interfaces/Slot/SlotRepositoryInterface";
// import { ISlot } from "../../models/commonModel/SlotModel";
// import { sentMail } from "../../utils/SendMail";
// import { v4 as uuidv4 } from "uuid";
// import { Server } from "socket.io";
// import { NotificationService } from "./NotificationService";
// import { NotificationType } from "../../models/commonModel/NotificationModel";

// export class BookingService implements IBookingService {
//   constructor(
//     private _bookingRepo: IBookingRepository,
//     private _doctorRepo: IDoctorRepository,
//     private _patientRepo: UserRepositoryInterface,
//     private _slotRepo: ISlotRepository,
//     private _notificationService: NotificationService
//   ) {}

//   // Send email with video call room ID
//   async sendVideoCallEmail(
//     bookingId: string,
//     roomId: string,
//     userId: string
//   ): Promise<void> {
//     try {
//       const booking = await this._bookingRepo.findById(bookingId);
//       if (!booking) {
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.BOOKING_NOT_FOUND
//         );
//       }

//       const user = await this._patientRepo.findById(userId);
//       if (!user) {
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.INVALID_PATIENT
//         );
//       }

//       const subject = "Video Call Appointment Details";
//       const html = `
//         <h3>Your Online Appointment</h3>
//         <p>Your appointment with Dr. ${booking.doctor_id} is scheduled.</p>
//         <p><strong>Room ID:</strong> ${roomId}</p>
//         <p>Please use this Room ID to join the video call at the scheduled time: ${
//           booking.appointmentTime
//         } on ${booking.appointmentDate.toDateString()}.</p>
//         <p><a href="${
//           process.env.CLIENT_URL
//         }/video-call?roomId=${roomId}&bookingId=${bookingId}">Join Video Call</a></p>
//       `;

//       const emailSent = await sentMail(user.email, subject, html);
//       if (!emailSent) {
//         throw new AppError(
//           HttpStatus.InternalServerError,
//           "Failed to send video call email"
//         );
//       }
//     } catch (error) {
//       console.error("Error sending video call email:", error);
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         "Failed to send video call email"
//       );
//     }
//   }

//   async createVideoCallRoom(
//     bookingId: string,
//     doctorId: string,
//     io: Server
//   ): Promise<{ roomId: string; booking: IBooking }> {
//     const booking = await this._bookingRepo.findById(bookingId);
//     if (!booking)
//       throw new AppError(
//         HttpStatus.NotFound,
//         MessageConstants.BOOKING_NOT_FOUND
//       );

//     if (booking.doctor_id._id.toString() !== doctorId) {
//       throw new AppError(
//         HttpStatus.Forbidden,
//         "Unauthorized: Doctor ID does not match"
//       );
//     }

//     if (
//       booking.modeOfAppointment !== "online" ||
//       booking.status !== AppointmentStatus.CONFIRMED
//     ) {
//       throw new AppError(
//         HttpStatus.BadRequest,
//         "Invalid booking for video call"
//       );
//     }

//     const roomId = uuidv4();
//     const updatedBooking = await this._bookingRepo.update(bookingId, {
//       videoCallRoomId: roomId,
//     });

//     if (!updatedBooking) {
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         "Failed to update booking with room ID"
//       );
//     }

//     // Emit to sockets
//     io.to(`doctor_${doctorId}`).emit("videoCallRoomCreated", {
//       bookingId,
//       roomId,
//       role: "doctor", // Explicitly set role
//     });
//     // Emit to user's room
//     io.to(`user_${updatedBooking.user_id}`).emit("videoCallRoomAssigned", {
//       bookingId,
//       roomId,
//       role: "user", // Explicitly set role
//     });

//     // Send video call notification
//     await this._notificationService.sendVideoCallNotification(
//       bookingId,
//       updatedBooking.user_id.toString(),
//       doctorId,
//       NotificationType.VIDEO_CALL_STARTING,
//       roomId
//     );

//     // Optional: Catch email errors silently
//     try {
//       await this.sendVideoCallEmail(
//         bookingId,
//         roomId,
//         updatedBooking.user_id.toString()
//       );
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError);
//     }

//     return { roomId, booking: updatedBooking };
//   }

//   // user side
//   async bookAppointment(bookingData: Partial<IBooking>): Promise<IBooking> {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const doctorId = new Types.ObjectId(bookingData.doctor_id);
//       const patientId = new Types.ObjectId(bookingData.user_id);
//       const slotId = new Types.ObjectId(bookingData.slot_id);

//       // Validate required fields
//       if (
//         !doctorId ||
//         !patientId ||
//         !slotId ||
//         !bookingData.appointmentDate ||
//         !bookingData.appointmentTime
//       ) {
//         throw new AppError(
//           HttpStatus.BadRequest,
//           MessageConstants.REQUIRED_FIELDS_MISSING
//         );
//       }

//       // // Check if user already has a booking for this slot
//       // const existingBooking = await this._bookingRepo.findOne({
//       //   user_id: patientId,
//       //   slot_id: slotId,
//       //   status: { $ne: AppointmentStatus.CANCELLED }, // Don't count cancelled appointments
//       // });

//       // if (existingBooking) {
//       //   throw new AppError(
//       //     HttpStatus.BadRequest,
//       //     "You already have an appointment booked for this time slot."
//       //   );
//       // }

//       const doctor = await this._doctorRepo.findById(doctorId.toString());
//       if (!doctor)
//         throw new AppError(
//           HttpStatus.BadRequest,
//           MessageConstants.INVALID_DOCTOR
//         );

//       const patient = await this._patientRepo.findById(patientId.toString());
//       if (!patient)
//         throw new AppError(
//           HttpStatus.BadRequest,
//           MessageConstants.INVALID_PATIENT
//         );

//       const slot = await this._slotRepo.findSlotById(slotId.toString());
//       if (!slot) throw new AppError(HttpStatus.BadRequest, "Invalid slot ID.");

//       if (slot.bookedCount >= slot.maxPatients) {
//         throw new AppError(
//           HttpStatus.BadRequest,
//           "No available slots for the selected time."
//         );
//       }

//       await this._slotRepo.updateSlot(slotId.toString(), {
//         $inc: { bookedCount: 1 },
//       } as UpdateQuery<ISlot>);

//       // Create booking
//       const booking = await this._bookingRepo.create({
//         ...bookingData,
//         doctor_id: doctorId,
//         user_id: patientId,
//         slot_id: slotId,
//         is_paid: true,
//         paymentMethod: bookingData.paymentMethod || "razorpay",
//         status: AppointmentStatus.CONFIRMED,
//       });

//       // Send booking confirmation notification to user
//       await this._notificationService.sendBookingNotification__(
//         booking._id.toString(),
//         patientId.toString(),
//         doctorId.toString(),
//         NotificationType.BOOKING_CONFIRMED,
//         "Booking Confirmed",
//         "Your appointment has been confirmed."
//       );

//       // Send new booking request notification to doctor
//       await this._notificationService.sendBookingNotification__(
//         booking._id.toString(),
//         patientId.toString(),
//         doctorId.toString(),
//         NotificationType.NEW_BOOKING_REQUEST,
//         "New Booking Request",
//         `A new appointment has been booked by ${patient.name}.`
//       );

//       await session.commitTransaction();

//       return booking;
//     } catch (error) {
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   async getAppointments(id: string): Promise<IBooking[]> {
//     // Return an array
//     try {
//       const bookings = await this._bookingRepo.findByUserId(id);

//       if (!bookings.length)
//         // Check if any records exist
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.BOOKING_NOT_FOUND
//         );

//       // Exclude cancelled appointments
//       const filteredBookings = bookings.filter(
//         (booking) => booking.status !== "cancelled"
//       );

//       if (!filteredBookings.length)
//         throw new AppError(HttpStatus.NotFound, "No active appointments found");

//       return filteredBookings;
//     } catch (error) {
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   async cancelAppointment(id: string): Promise<IBooking> {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       const booking = await this._bookingRepo.findById(id);
//       if (!booking)
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.BOOKING_NOT_FOUND
//         );
//       if (booking.status === AppointmentStatus.CANCELLED)
//         throw new AppError(
//           HttpStatus.BadRequest,
//           MessageConstants.BOOKING_ALREADY_CANCELLED
//         );

//       const updatedBooking = await this._bookingRepo.updateStatus(
//         id,
//         AppointmentStatus.CANCELLED
//       );
//       if (!updatedBooking)
//         throw new AppError(
//           HttpStatus.InternalServerError,
//           MessageConstants.INTERNAL_SERVER_ERROR
//         );

//       // Send cancellation notification to user
//       await this._notificationService.sendBookingNotification__(
//         id,
//         booking.user_id.toString(),
//         booking.doctor_id._id.toString(),
//         NotificationType.BOOKING_CANCELLED,
//         "Booking Cancelled",
//         "Your appointment has been cancelled."
//       );

//       // Send patient cancelled notification to doctor
//       await this._notificationService.sendBookingNotification__(
//         id,
//         booking.user_id.toString(),
//         booking.doctor_id._id.toString(),
//         NotificationType.PATIENT_CANCELLED,
//         "Patient Cancelled Appointment",
//         "The patient has cancelled their appointment."
//       );

//       await session.commitTransaction();
//       return updatedBooking;
//     } catch (error) {
//       await session.abortTransaction();
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     } finally {
//       session.endSession();
//     }
//   }

//   async confirmAppointment(id: string, paymentId: string): Promise<IBooking> {
//     try {
//       console.log("Booking ID:", id);

//       const booking = await this._bookingRepo.findById(id);
//       if (!booking)
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.BOOKING_NOT_FOUND
//         );

//       if (
//         booking.status !== AppointmentStatus.PENDING &&
//         booking.status !== AppointmentStatus.PAYMENT_FAILED
//       ) {
//         throw new AppError(
//           HttpStatus.BadRequest,
//           `${MessageConstants.INVALID_BOOKING_STATUS}: ${booking.status}`
//         );
//       }

//       const updatedBooking = await this._bookingRepo.update(id, {
//         status: AppointmentStatus.PENDING,
//         paymentId,
//         paymentMethod: "razorpay",
//       });

//       if (!updatedBooking)
//         throw new AppError(
//           HttpStatus.InternalServerError,
//           MessageConstants.INTERNAL_SERVER_ERROR
//         );

//         // Send payment received notification
//       await this._notificationService.sendBookingNotification__(
//         id,
//         booking.user_id.toString(),
//         booking.doctor_id._id.toString(),
//         NotificationType.PAYMENT_RECEIVED,
//         "Payment Received",
//         "Your payment has been successfully processed."
//       );

//       // Send booking confirmed notification
//       await this._notificationService.sendBookingNotification__(
//         id,
//         booking.user_id.toString(),
//         booking.doctor_id._id.toString(),
//         NotificationType.BOOKING_CONFIRMED,
//         "Booking Confirmed",
//         "Your appointment has been confirmed."
//       );

//       return updatedBooking;
//     } catch (error) {
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   async failAppointment(id: string, paymentId: string): Promise<IBooking> {
//     try {
//       const booking = await this._bookingRepo.findById(id);
//       if (!booking)
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.BOOKING_NOT_FOUND
//         );

//       if (booking.status !== AppointmentStatus.PENDING) {
//         throw new AppError(
//           HttpStatus.BadRequest,
//           `${MessageConstants.INVALID_BOOKING_STATUS}: ${booking.status}`
//         );
//       }

//       const updatedBooking = await this._bookingRepo.update(id, {
//         status: AppointmentStatus.PAYMENT_FAILED,
//         paymentId,
//       });

//       if (!updatedBooking)
//         throw new AppError(
//           HttpStatus.InternalServerError,
//           MessageConstants.INTERNAL_SERVER_ERROR
//         );

//         // Send payment failed notification
//       await this._notificationService.sendBookingNotification__(
//         id,
//         booking.user_id.toString(),
//         booking.doctor_id._id.toString(),
//         NotificationType.PAYMENT_FAILED,
//         "Payment Failed",
//         "Your payment attempt failed. Please try again."
//       );

//       return updatedBooking;
//     } catch (error) {
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//    async sendAppointmentReminders(): Promise<void> {
//     try {
//       const now = new Date();
//       const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//       const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

//       const bookings = await this._bookingRepo.find({
//         status: AppointmentStatus.CONFIRMED,
//         appointmentDate: { $gte: now, $lte: in24Hours },
//       });

//       for (const booking of bookings) {
//         const appointmentDateTime = new Date(
//           `${booking.appointmentDate.toISOString().split('T')[0]}T${booking.appointmentTime}`
//         );
//         const timeDiff = appointmentDateTime.getTime() - now.getTime();
//         const hours = Math.floor(timeDiff / (1000 * 60 * 60));

//         if (hours <= 24 && hours > 23) {
//           await this._notificationService.sendAppointmentReminder__(
//             booking._id.toString(),
//             booking.user_id.toString(),
//             booking.doctor_id._id.toString(),
//             24
//           );
//         } else if (hours <= 1 && hours > 0) {
//           await this._notificationService.sendAppointmentReminder__(
//             booking._id.toString(),
//             booking.user_id.toString(),
//             booking.doctor_id._id.toString(),
//             1
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Error sending appointment reminders:", error);
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         "Failed to send appointment reminders"
//       );
//     }
//   }

//   // doctors side
//   async getAvailableDoctors(
//     doctorId: string,
//     appointmentDate: Date,
//     appointmentTime: string
//   ): Promise<any[]> {
//     try {
//       const AllDoctors = await this._doctorRepo.findAllDoctor();

//       const availabilityPromises = AllDoctors.map(async (doctor) => {
//         const existingDoctor = await this._bookingRepo.findAvailability(
//           doctorId,
//           doctor._id.toString(),
//           appointmentDate,
//           appointmentTime
//         );
//         return existingDoctor < (doctor.isApproved ? 1 : 0) ? doctor : null;
//       });
//       return (await Promise.all(availabilityPromises)).filter(
//         (doctor) => doctor !== null
//       );
//     } catch (error) {
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   async getUserAppointmentWithPagination(
//     userId: string,
//     page: number,
//     limit: number,
//     status?: AppointmentStatus
//   ): Promise<{ appointment: IBooking[]; total: number }> {
//     try {
//       const skip = (page - 1) * limit;
//       const [appointment, total] = await Promise.all([
//         this._bookingRepo.findByUserIdWithPagination(
//           userId,
//           skip,
//           limit,
//           status
//         ),
//         this._bookingRepo.countByUserId(userId, status),
//       ]);
//       return { appointment, total };
//     } catch (error) {
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   async getDoctorAppointments(
//     doctorID: string,
//     page: number,
//     limit: number,
//     status?: AppointmentStatus
//   ): Promise<{ appointment: IBooking[]; total: number }> {
//     try {
//       const doctor = await this._bookingRepo.findByDoctorId(doctorID);
//       if (!doctor)
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.DOCTOR_NOT_FOUND
//         );

//       const skip = (page - 1) * limit;
//       const [appointment, total] = await Promise.all([
//         this._bookingRepo.findByDoctorIdWithPagination(
//           doctorID,
//           skip,
//           limit,
//           status
//         ),
//         this._bookingRepo.countByDoctorId(doctorID, status),
//       ]);

//       return { appointment, total };
//     } catch (error) {
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   async updateDoctorAppointmentStatus(
//     appointmentID: string,
//     doctorID: string,
//     status: "confirmed" | "completed" | "cancelled"
//   ): Promise<IBooking | null> {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       console.log(
//         `Starting appointment update - ID: ${appointmentID}, Status: ${status}, Doctor: ${doctorID}`
//       );

//       const appointment = await this._bookingRepo.findById(appointmentID);
//       if (!appointment)
//         throw new AppError(
//           HttpStatus.NotFound,
//           MessageConstants.BOOKING_NOT_FOUND
//         );

//       if (appointment.doctor_id._id.toString() !== doctorID) {
//         throw new AppError(
//           HttpStatus.Forbidden,
//           MessageConstants.PERMISSION_DENIED
//         );
//       }

//       // Define valid status transitions
//       const validTransitions: Record<string, AppointmentStatus[]> = {
//         [AppointmentStatus.PENDING]: [
//           AppointmentStatus.CONFIRMED,
//           AppointmentStatus.CANCELLED,
//         ],
//         [AppointmentStatus.CONFIRMED]: [
//           AppointmentStatus.COMPLETED,
//           AppointmentStatus.CANCELLED,
//         ],
//       };

//       if (
//         !validTransitions[appointment.status]?.includes(
//           status as AppointmentStatus
//         )
//       ) {
//         throw new AppError(
//           HttpStatus.BadRequest,
//           MessageConstants.INVALID_BOOKING_STATUS
//         );
//       }

//       // Map status to the enum
//       const mappedStatus =
//         status === "confirmed"
//           ? AppointmentStatus.CONFIRMED
//           : status === "completed"
//           ? AppointmentStatus.COMPLETED
//           : AppointmentStatus.CANCELLED;

//       const updatedAppointment = await this._bookingRepo.update(appointmentID, {
//         status: mappedStatus,
//       });

//       if (!updatedAppointment)
//         throw new AppError(
//           HttpStatus.InternalServerError,
//           MessageConstants.INTERNAL_SERVER_ERROR
//         );

//         // Send notifications based on the new status
//       if (mappedStatus === AppointmentStatus.CONFIRMED) {
//         await this._notificationService.sendBookingNotification__(
//           appointmentID,
//           appointment.user_id.toString(),
//           doctorID,
//           NotificationType.BOOKING_CONFIRMED,
//           "Booking Confirmed",
//           "Your appointment has been confirmed by the doctor."
//         );
//       } else if (mappedStatus === AppointmentStatus.COMPLETED) {
//         await this._notificationService.sendBookingNotification__(
//           appointmentID,
//           appointment.user_id.toString(),
//           doctorID,
//           NotificationType.CALL_ENDED,
//           "Call Ended",
//           "Your appointment has been completed."
//         );
//       } else if (mappedStatus === AppointmentStatus.CANCELLED) {
//         await this._notificationService.sendBookingNotification__(
//           appointmentID,
//           appointment.user_id.toString(),
//           doctorID,
//           NotificationType.BOOKING_CANCELLED,
//           "Booking Cancelled",
//           "Your appointment has been cancelled by the doctor."
//         );

//         await this._notificationService.sendBookingNotification__(
//           appointmentID,
//           appointment.user_id.toString(),
//           doctorID,
//           NotificationType.PATIENT_CANCELLED,
//           "Patient Cancelled Appointment",
//           "The patient has cancelled their appointment."
//         );
//       }

//       await session.commitTransaction();
//       return updatedAppointment;
//     } catch (error) {
//       await session.abortTransaction();
//       if (error instanceof AppError) throw error;
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     } finally {
//       session.endSession();
//     }
//   }

//   public async getUserBookings(
//     userId: string,
//     doctorId?: string
//   ): Promise<IBooking[]> {
//     try {
//       const userIdObj = new Types.ObjectId(userId);
//       const doctorIdObj = doctorId ? new Types.ObjectId(doctorId) : undefined;

//       return await this._bookingRepo.findByUserSlotId(userIdObj, doctorIdObj);
//     } catch (error) {
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         "Failed to fetch user bookings"
//       );
//     }
//   }

//   public async checkUserBooking(
//     userId: string,
//     slotId: string
//   ): Promise<boolean> {
//     try {
//       const userIdObj = new Types.ObjectId(userId);
//       const slotIdObj = new Types.ObjectId(slotId);

//       const existingBooking = await this._bookingRepo.findOneByUserAndSlot(
//         userIdObj,
//         slotIdObj
//       );
//       return !!existingBooking;
//     } catch (error) {
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         "Failed to check user booking"
//       );
//     }
//   }

//   // get user data for a perticular doctor:
//   async getPatientsForDoctor(
//     doctorId: string,
//     page: number = 1,
//     limit: number = 10
//   ): Promise<{ patients: IBooking[]; total: number }> {
//     console.log("from service", doctorId);
//     const { patients, total } = await this._bookingRepo.getPatientsForDoctor(
//       doctorId,
//       page,
//       limit
//     );
//     console.log("patient from service", patients);
//     return { patients, total };
//   }

//   async getAllBookings(
//     page: number = 1,
//     limit: number = 10,
//     status?: AppointmentStatus
//   ): Promise<{ bookings: IBooking[]; total: number; totalPages: number }> {
//     try {
//       const skip = (page - 1) * limit;
//       const { bookings, total } =
//         await this._bookingRepo.findAllBookingsWithPagination(
//           skip,
//           limit,
//           status
//         );

//       return {
//         bookings,
//         total,
//         totalPages: Math.ceil(total / limit),
//       };
//     } catch (error) {
//       throw new AppError(
//         HttpStatus.InternalServerError,
//         MessageConstants.INTERNAL_SERVER_ERROR
//       );
//     }
//   }
// }
