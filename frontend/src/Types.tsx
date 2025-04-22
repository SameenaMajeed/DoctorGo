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

interface MedicalRecord {
  date: string;
  complaint: string;
  cost: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
}

export interface Patient {
  name: string;
  email?: string;
  phone?: string;
  records: MedicalRecord[];
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  duration: string;
  composition?: string;
}

export interface Prescription {
  doctorName: string;
  qualification: string;
  regNo: string;
  hospital: string;
  address: string;
  contact: string;
  patientId: string;
  patientDetails: string;
  patientMobile: string;
  patientAddress: string;
  vitals: string;
  date: string;
  complaints: string[];
  findings: string[];
  diagnosis: string[];
  medications: Medication[];
  advice: string[];
  followUp: string;
  note?: string;
}

// export interface Medication {
//   name: string;
//   dosage: string;
//   duration: string;
// }

// export interface Prescription {
//   id: string;
//   patientName: string;
//   age: number;
//   gender: string;
//   appointmentId: string;
//   date: string;
//   doctorName: string;
//   specialization: string;
//   clinicName: string;
//   diagnosis: string;
//   medications: Medication[];
//   notes: string;
// }
