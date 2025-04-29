import { User } from "./types/auth";
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

// interface Patient{
//   patientName : string
// }

export interface Appointment {
    _id: string;
    doctor_id: Doctor; // Ensure doctor_id is an object, not a string
    user_id: User | string;
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


// Interface for frontend display (adjusted to match backend)
export interface MedicalRecord {
  _id: string;
  date: string;
  complaint: string; 
  diagnosis: string; 
  treatment: string; 
  prescription: string; 
  cost: string; 
}

export interface Patient {
  name: string;
  email?: string;
  phone?: string;
  records: MedicalRecord[];
}

export interface TestReport {
  img: string;
}

export interface Medicine {
  name: string;
  quantity: number;
  time_gap: string;
}

export interface Prescription {
  _id: string;
  userId: string;
  doctorId: string;
  medicines: Medicine[];
  symptoms: string;
  disease: string;
  testReports: TestReport[];
  vitalSigns?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  doctor_id: string;
  user_id : string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface ReviewFormData {
  doctor_id: string | undefined;
  rating: number;
  reviewText: string;
}
