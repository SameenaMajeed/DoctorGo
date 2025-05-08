import { Types } from "mongoose";
import { AppointmentStatus, IBooking } from "../../models/BookingModel";

export interface IBookingRepository {
    create(bookingData: Partial<IBooking>): Promise<IBooking>;
    // save(bookingData: IBooking): Promise<IBooking>;
    // getUserAppointments(user_id: string): Promise<IBooking[]>;
    findById(id: string): Promise<IBooking | null>;

    updateStatus(id: string, status: AppointmentStatus): Promise<IBooking | null>
    update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null>;
    findAvailability(doctorId: string, doctorTypeId: string, appointmentDate: Date, appointmentTime: string): Promise<number>
    findAvailableDoctor(doctorID: string, date: Date, timeSlot: string): Promise<IBooking[]>
    findByUserId(userId: string, doctorId?: Types.ObjectId): Promise<IBooking[]>;
    findByDoctorId(id: string): Promise<IBooking[]>
    findByDoctorIdWithPagination(
        doctorId: string,
        skip: number,
        limit: number,
        status?: AppointmentStatus
    ): Promise<IBooking[]>;
    countByDoctorId(doctorId: string, status?: AppointmentStatus): Promise<number>;
    findByUserIdWithPagination(
        userId: string,
        skip: number,
        limit: number,
        status?: AppointmentStatus
    ): Promise<IBooking[]>;
    countByUserId(userId: string, status?: AppointmentStatus): Promise<number>;
    findOne(filter: any): Promise<IBooking | null>;

    findByUserSlotId(userId: Types.ObjectId, doctorId?: Types.ObjectId): Promise<IBooking[]>
    findOneByUserAndSlot(userId: Types.ObjectId, slotId: Types.ObjectId): Promise<IBooking | null>;

    getPatientsForDoctor(doctorId: string) : Promise<IBooking []>

    findAppointmentByDoctorAndPatient(doctorId: string, patientId: string): Promise<IBooking | null>;

    findAppointmentById(id: string): Promise<IBooking | null>;
}