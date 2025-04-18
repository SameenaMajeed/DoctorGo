import { IBooking } from "../../models/BookingModel";
import {AppointmentStatus} from '../../models/BookingModel'

export interface IBookingService {
    bookAppointment(bookingData: Partial<IBooking>): Promise<IBooking> ;
    getAppointments(id: string): Promise<IBooking[]>;
    cancelAppointment(id: string):Promise<IBooking>;
    confirmAppointment(id: string, paymentId: string):Promise<IBooking>;
    failAppointment(id: string, paymentId: string):Promise<IBooking>;
    getAvailableDoctors(doctorId : string , appointmentDate : Date , appointmentTime : string) : Promise<any[]>
    getUserAppointmentWithPagination(
        userId: string,
        page: number,
        limit: number,
        status?:AppointmentStatus
    ):Promise<{appointment : IBooking[] ;total : number}>;
    getDoctorAppointments(
        doctorID : string ,
        page:number,
        limit : number ,
        status?:AppointmentStatus
    ):Promise<{appointment : IBooking[] ;total : number}>;
    updateDoctorAppointmentStatus(
        appointmentID : string ,
        doctorID : string,
        status :'completed' | 'cancelled',
    ):Promise<IBooking | null>;
    // rescheduleAppointment(bookingId: string, newDate: Date, newTime: string):Promise<any>

    getUserBookings(userId: string, doctorId?: string): Promise<IBooking[]>
    checkUserBooking(userId: string, slotId: string): Promise<boolean>
}   

