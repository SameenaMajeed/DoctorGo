import { SlotData } from "./types/Slot";

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  profilePicture ?: string;
  role: string | null;
  accessToken?:string,
  refreshToken ?:string,
}

interface Patient{
  patientName : string
}

export interface Appointment {
    _id: string;
    doctor_id: Doctor; // Ensure doctor_id is an object, not a string
    user_id: { _id: string; name: string; email: string } | string;
    slot_id: SlotData;
    appointmentDate: string;
    appointmentTime: string;
    modeOfAppointment: string;
    status: string;
    is_paid: boolean;
    paymentId: string;
    paymentMethod: string;
    ticketPrice: number;
    patientDetails : Patient;
}
