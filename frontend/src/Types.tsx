import { IUser } from "./types/auth";
import { AppointmentStatus } from "./types/paymentTypes";
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
  ticketPrice : number,
  isOnline : boolean,
  averageRating: number;
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


export interface Wallet {
  _id: string;
  user_id: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  _id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  booking_id?: string;
  createdAt: Date;
}

export interface IBooking {
  createdAt: string;
  _id: string;
  doctor_id: {
    _id: string;
    name: string;
    specialization: string;
  };
  user_id: {
    _id: string;
    name: string;
  };
  ticketPrice: number;
  status: AppointmentStatus;
  appointmentDate: string;
  totalAmount: number;
  platformFee : number
  appointmentTime: string
  modeOfAppointment: "online" | "offline"
  is_paid: boolean
  paymentMethod?: "razorpay" | "wallet"
  patientDetails: {
    patientName: string
    contactNumber: string
    district: string
    locality: string
  }
  updatedAt: string
}


export interface IDashboardSummary {
  totalRevenue: number;
  totalBookings: number;
  activeDoctors: number;
  activePatients: number;
  adminShare: number;
}

export interface IBookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface ITrend {
  date: string;
  count: number;
  revenue: number;
}

export interface ISpecialtyActivity {
  _id: string;
  name: string;
  bookings: number;
}

export interface ITopDoctor {
  _id: string;
  name: string;
  revenue: number;
  bookings: number;
}

export interface IPatientGrowth {
  date: string;
  count: number;
}

export interface ITopPatient {
  id: string
  name: string
  totalBookings: number
  totalSpent: number
}

export interface IDashboardData {
  pendingApprovals: number
  topPatients: ITopPatient[]
  recentBookings: IBooking[]
  platformFreeTotal: number
  totalBookings : number
}

export type DashboardFilter = "daily" | "monthly" | "yearly" | "custom"

export interface DashboardFilters {
  filter: DashboardFilter
  startDate?: string
  endDate?: string
  doctorId?: string
}

// export interface IPatient {
//   _id: string;
//   name: string;
//   totalBookings: number;
//   totalSpent: number;
// }


export interface DoctorRevenue {
  _id: string
  name: string
  email: string
  specialization?: string
  profilePicture?: string
  totalAppointments: number
  totalRevenue: number
  averageRevenuePerAppointment?: number
}
