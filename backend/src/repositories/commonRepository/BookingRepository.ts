import { Types } from "mongoose";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { IBookingRepository } from "../../interfaces/Booking/BookingRepositoryInterface";
import Booking, {
  AppointmentStatus,
  IBooking,
} from "../../models/commonModel/BookingModel";
import { AppError } from "../../utils/AppError";
import { BaseRepository } from "./BaseRepository";

export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository
{
  constructor() {
    super(Booking);
  }


   async find(query: any): Promise<IBooking[]> {
    try {
      return await Booking.find(query)
        .populate("doctor_id", "name specialization")
        .populate("user_id", "name email")
        .exec();
    } catch (error) {
      console.error("Error in find:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }


  async findById(id: string): Promise<IBooking | null> {
    try {
      let doctor = await Booking.findById(id)
        .populate("doctor_id", "name")
        .exec();

      console.log(doctor);
      return doctor;
    } catch (error) {
      console.error("Error in findById:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAppointmentById(id: string): Promise<IBooking | null> {
    try {
      let appointment = await Booking.findById(id)
        .select("doctor_id user_id status") // Only select needed fields
        .lean();
      console.log(appointment);
      return appointment;
    } catch (error) {
      console.error("Error in findById:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus
  ): Promise<IBooking | null> {
    try {
      return await Booking.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).exec();
    } catch (error) {
      console.error("Error in updateStatus:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAvailability(
    doctorId: string,
    doctorTypeId: string,
    appointmentDate: Date,
    appointmentTime: string
  ): Promise<number> {
    try {
      const startOfDay = new Date(appointmentDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(appointmentDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const query = {
        branch: doctorId,
        tableType: doctorTypeId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        appointmentTime,
        status: {
          $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
        },
      };

      return await Booking.countDocuments(query);
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAvailableDoctor(
    doctorID: string,
    date: Date,
    timeSlot: string
  ): Promise<IBooking[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      return await Booking.find({
        doctor_id: doctorID, // Changed from 'doctor'
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        appointmentTime: timeSlot, // Changed from 'timeSlot'
        status: {
          $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING],
        },
      }).exec();
    } catch (error) {
      console.error("Error in findAvailableDoctor:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByDoctorId(id: string): Promise<IBooking[]> {
    try {
      const appointments = await Booking.find({ doctor_id: id })
        .populate("user_id", "name email phone")
        .exec();
      return appointments;
    } catch (error) {
      console.error("Error in findByUserId:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByUserId(id: string): Promise<IBooking[]> {
    try {
      return await Booking.find({ user_id: id })
        .populate(
          "doctor_id",
          "name specialization profilePicture qualification"
        )
        .populate("slot_id", "startTime endTime")
        .exec();
    } catch (error) {
      console.error("Error in findByUserId:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByDoctorIdWithPagination(
    doctorId: string,
    skip: number,
    limit: number,
    status?: AppointmentStatus
  ): Promise<IBooking[]> {
    try {
      const query: any = { doctor_id: doctorId };
      if (status) query.status = status;

      const appointments = await Booking.find(query)
        .populate("user_id", "name email mobile_no profilePicture age")
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      return appointments;
    } catch (error) {
      console.error("Error in findByDoctorIdWithPagination:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async countByDoctorId(
    doctorId: string,
    status?: AppointmentStatus
  ): Promise<number> {
    try {
      const query: any = { doctor_id: doctorId };
      if (status) query.status = status;
      return await Booking.countDocuments(query).exec();
    } catch (error) {
      console.error("Error in countByDoctorId:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByUserIdWithPagination(
    userId: string,
    skip: number,
    limit: number,
    status?: AppointmentStatus
  ): Promise<IBooking[]> {
    try {
      const query: any = { userId };
      if (status) query.status = status;
      return await Booking.find(query)
        .populate("doctor")
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error("Error in findByUserIdWithPagination:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async countByUserId(
    userId: string,
    status?: AppointmentStatus
  ): Promise<number> {
    try {
      const query: any = { userId };
      if (status) query.status = status;
      return await Booking.countDocuments(query).exec();
    } catch (error) {
      console.error("Error in countByUserId:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async findByUserSlotId(
    userId: Types.ObjectId,
    doctorId?: Types.ObjectId
  ): Promise<IBooking[]> {
    const query: any = {
      user_id: userId,
      status: { $ne: "cancelled" },
    };

    if (doctorId) {
      query.doctor_id = doctorId;
    }

    return await Booking.find(query)
      .populate("doctor_id", "name profilePicture specialization")
      .populate("slot_id", "startTime endTime date")
      .exec();
  }

  public async findOneByUserAndSlot(
    userId: Types.ObjectId,
    slotId: Types.ObjectId
  ): Promise<IBooking | null> {
    return await Booking.findOne({
      user_id: userId,
      slot_id: slotId,
      status: { $ne: "cancelled" },
    }).exec();
  }

  // get User data for the perticular doctor
  async getPatientsForDoctor(
    doctorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ patients: IBooking[]; total: number }> {
    console.log("from repo", doctorId);
    const [patients, total] = await Promise.all([
      Booking.find({ doctor_id: doctorId })
        .populate("user_id", "name email mobile_no gender age profilePicture")
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      Booking.countDocuments({ doctor_id: doctorId }),
    ]);
    return { patients, total };
  }

  // review
  async findAppointmentByDoctorAndPatient(
    doctorId: string,
    patientId: string
  ): Promise<IBooking | null> {
    return await Booking.findOne({
      doctor_id: doctorId,
      user_id: patientId,
      status: "completed",
    });
  }

  async findAllBookingsWithPagination(
    skip: number,
    limit: number,
    status?: AppointmentStatus
  ): Promise<{ bookings: IBooking[]; total: number }> {
    try {
      const query: any = {};
      if (status) query.status = status;

      const [bookings, total] = await Promise.all([
        Booking.find(query)
          .populate("doctor_id", "name") 
          .populate("user_id", "name") 
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Booking.countDocuments(query),
      ]);

      return { bookings, total };
    } catch (error) {
      console.error("Error in findAllBookingsWithPagination:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

 async countAppointments(filter: any): Promise<number> {
  const total = await Booking.countDocuments(filter);
  console.log('Total:', total);
  return total;
}

async findTodaysAppointments(doctorId: string, startOfDay: Date, endOfDay: Date): Promise<IBooking[]> {
  return Booking.find({
    doctor_id: doctorId, // use correct DB field name
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $ne: 'cancelled' }
  }).sort({ appointmentDate: 1 });
}

}
