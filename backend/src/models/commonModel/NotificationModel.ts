import mongoose, { Schema, model, Document } from "mongoose";

export enum NotificationType {
  BOOKING_CONFIRMED = "BOOKING_CONFIRMED",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  BOOKING_RESCHEDULED = "BOOKING_RESCHEDULED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  APPOINTMENT_REMINDER_24H = "APPOINTMENT_REMINDER_24H",
  APPOINTMENT_REMINDER_1H = "APPOINTMENT_REMINDER_1H",
  VIDEO_CALL_STARTING = "VIDEO_CALL_STARTING",
  NEW_BOOKING_REQUEST = "NEW_BOOKING_REQUEST",
  PATIENT_IN_WAITING_ROOM = "PATIENT_IN_WAITING_ROOM",
  PATIENT_CANCELLED = "PATIENT_CANCELLED",
  PATIENT_RESCHEDULED_REQUEST = "PATIENT_RESCHEDULED_REQUEST",
  CALL_STARTED = "CALL_STARTED",
  CALL_ENDED = "CALL_ENDED",
  PATIENT_WAITING = "PATIENT_WAITING",
  CALL_REMINDER = "CALL_REMINDER",
}

export interface INotification extends Document {
  recipientId: string;
  recipientType: "user" | "doctor";
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  // metadata?: Record<string, any>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: true },
    recipientType: { type: String, enum: ["user", "doctor"], required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
    // metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
