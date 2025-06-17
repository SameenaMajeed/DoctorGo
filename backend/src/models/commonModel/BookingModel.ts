import mongoose, { Schema, Document } from "mongoose";

export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PAYMENT_FAILED = "payment_failed",
  CANCELLED = "cancelled",
  PAYMENT_PENDING = "payment_pending",
  EXPIRED = "expired",
  COMPLETED = "completed",
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  session: string;
  modeOfAppointment: "online" | "offline";
  is_paid: boolean;
  status: AppointmentStatus;
  paymentId?: string;
  paymentMethod?: "razorpay"; // | 'wallet';
  ticketPrice: number;
  platformFee: number;
  totalAmount: number;
  paymentBreakdown: {
    doctorFee: number;
    platformFee: number;
    tax?: number;
  };
  appointmentDate: Date;
  appointmentTime: string;
  cancellationReason?: string;
  rescheduledDate?: Date;
  doctorNotes?: string;
  patientDetails?: {
    patientName: string;
    contactNumber: string;
    district: string;
    locality: string;
    hospitalNo?: string;
  };
  slot_id: mongoose.Types.ObjectId; // Add reference to slot
  createdAt: Date;
  updatedAt: Date;
  videoCallRoomId?: string;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slot_id: { type: Schema.Types.ObjectId, ref: "Slot", required: true }, // New field
    session: { type: String },
    modeOfAppointment: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    is_paid: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PAYMENT_PENDING,
    },
    paymentId: { type: String },
    paymentMethod: { type: String, enum: ["razorpay"] },
    ticketPrice: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentBreakdown: {
      doctorFee: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      tax: { type: Number, default: 0 },
    },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    cancellationReason: { type: String },
    rescheduledDate: { type: Date },
    doctorNotes: { type: String },
    patientDetails: {
      // New subdocument
      patientName: { type: String, required: true },
      contactNumber: { type: String, required: true },
      district: { type: String, required: true },
      locality: { type: String, required: true },
      hospitalNo: { type: String },
    },
    videoCallRoomId: { type: String, required: false },
  },
  { timestamps: true }
);

// Add index for better query performance
BookingSchema.index({ doctor_id: 1, appointmentDate: 1 });
BookingSchema.index({ user_id: 1, status: 1 });
// Add index for video call room ID if needed for querying
BookingSchema.index({ videoCallRoomId: 1 });

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
