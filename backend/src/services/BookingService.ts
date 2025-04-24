import mongoose, { Types, UpdateQuery } from "mongoose";
import { IBookingService } from "../interfaces/Booking/BookingServiceInterface";
import { IBookingRepository } from "../interfaces/Booking/BookingRepositoryInterface";
import { AppointmentStatus, IBooking } from "../models/BookingModel";
import { MessageConstants } from "../constants/MessageConstants";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/Httpstatus";
import { IDoctorRepository } from "../interfaces/doctor/doctorRepositoryInterface";
import { UserRepositoryInterface } from "../interfaces/user/UserRepositoryInterface";
import { ISlotRepository } from "../interfaces/Slot/SlotRepositoryInterface";
import { ISlot } from "../models/SlotModel";

export class BookingService implements IBookingService {
  constructor(
    private _bookingRepo: IBookingRepository,
    private _doctorRepo: IDoctorRepository,
    private _patientRepo: UserRepositoryInterface,
    private _slotRepo: ISlotRepository
  ) {}

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

      const slot = await this._slotRepo.findSlotById(slotId.toString());
      if (!slot) throw new AppError(HttpStatus.BadRequest, "Invalid slot ID.");

      if (slot.bookedCount >= slot.maxPatients) {
        throw new AppError(
          HttpStatus.BadRequest,
          "No available slots for the selected time."
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
        is_paid: true,
        paymentMethod: bookingData.paymentMethod || "razorpay",
        status: AppointmentStatus.CONFIRMED,
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

  // async getAppointments(id: string): Promise<IBooking[]> {
  //   try {
  //     const bookings = await this._bookingRepo.findByUserId(id)

  //     if (!bookings.length)
  //       throw new AppError(
  //         HttpStatus.NotFound,
  //         MessageConstants.BOOKING_NOT_FOUND
  //       );

  //     // Exclude cancelled appointments
  //     const filteredBookings = bookings.filter(
  //       (booking) => booking.status !== "cancelled"
  //     );

  //     if (!filteredBookings.length)
  //       throw new AppError(HttpStatus.NotFound, "No active appointments found");

  //     // Ensure appointmentTime is properly formatted
  //     const updatedBookings = filteredBookings.map((booking) => {
  //       if (booking.slot_id) {
  //         booking.appointmentTime = `${booking.slot_id.startTime} - ${booking.slot_id.endTime}`;
  //       } else {
  //         booking.appointmentTime = "Time not available";
  //       }
  //       return booking;
  //     });

  //     return updatedBookings;
  //   } catch (error) {
  //     if (error instanceof AppError) throw error;
  //     throw new AppError(
  //       HttpStatus.InternalServerError,
  //       MessageConstants.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

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

       // Exclude cancelled appointments
    const filteredBookings = bookings.filter(
      (booking) => booking.status !== "cancelled"
    );

    if (!filteredBookings.length)
      throw new AppError(
        HttpStatus.NotFound,
        "No active appointments found"
      );

    return filteredBookings;

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
  async getPatientsForDoctor(doctorId: string) :Promise<IBooking[]> {
    console.log('from service',doctorId)
    const patients = await this._bookingRepo.getPatientsForDoctor(doctorId);
    console.log('patient from service',patients)
    return patients
}
}
