import { IUser } from "./types/auth";
import { ISlotData } from "./types/Slot";

export interface IDoctor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  specialization: string;
  profilePicture ?: string;
  role: string | null;
  accessToken?:string,
  refreshToken ?:string,
  ticketPrice ?: number,
  isOnline : boolean,
  rating?: number;
  reviewsCount?: number;
  extraCharge?: number; 
  bio?: string;
  experience?: number;

}

// interface Patient{
//   patientName : string
// }

export interface IAppointment {
    _id: string;
    doctor_id: IDoctor; // Ensure doctor_id is an object, not a string
    user_id: IUser | string;
    slot_id: ISlotData;
    appointmentDate: string;
    appointmentTime: string;
    modeOfAppointment: string;
    status: string;
    is_paid: boolean;
    paymentId: string;
    paymentMethod: string;
    ticketPrice: number;
    patientDetails : IPatient;
}


// Interface for frontend display (adjusted to match backend)
export interface IMedicalRecord {
  _id: string;
  date: string;
  complaint: string; 
  diagnosis: string; 
  treatment: string; 
  prescription: string; 
  cost: string; 
}

export interface IPatient {
  patientName: string;
  contactNumber?: string;
  phone?: string;
  records: IMedicalRecord[];
}

export interface ITestReport {
  img: string;
}

export interface IMedicine {
  name: string;
  quantity: number;
  time_gap: string;
  dosage: string;
}

export interface IPrescription {
  _id: string;
  userId: IUser;       
  doctorId: IDoctor;      
  medicines: IMedicine[];
  symptoms: string;
  disease: string;
  testReports: ITestReport[];
  vitalSigns?: string;
  createdAt: string;
  updatedAt?: string;
  followUpDate?: string;
}

export interface IReview {
  _id: string;
  doctor_id: string;
  user_id : { name: string , profilePicture?: string};
  rating: number;
  reviewText: string;
  createdAt: string;
  // appointmentId: string;
}

export interface IReviewFormData {
  doctor_id: string | undefined;
  _id?: string;
  // appointmentId: string | undefined;
  rating: number;
  reviewText: string;
  reviewId : string | undefined
}


export interface IMessage {
  _id: string;
  userId: string;
  doctorId: string;
  senderId: string;
  senderRole: "user" | "doctor";
  message: string;
  timestamp: string | Date;
}

export interface IChatUser {
  id: string;
  name: string;
  email?: string;
  mobile_no?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  online?: boolean;
  specialization?: string;
  qualification?: string;
  unreadCount?: number;
}


export type NetworkQuality = "good" | "poor" | "bad";
export type VideoQuality = "high" | "low";
export type CallStatus = "idle" | "calling" | "ringing" | "connecting" | "active" | "failed";
