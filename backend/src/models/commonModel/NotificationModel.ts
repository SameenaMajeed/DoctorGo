import { Schema, model, Document } from 'mongoose';

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  APPOINTMENT_REMINDER_24H = 'APPOINTMENT_REMINDER_24H',
  APPOINTMENT_REMINDER_1H = 'APPOINTMENT_REMINDER_1H',
  VIDEO_CALL_STARTING = 'VIDEO_CALL_STARTING',
  NEW_BOOKING_REQUEST = 'NEW_BOOKING_REQUEST',
  PATIENT_IN_WAITING_ROOM = 'PATIENT_IN_WAITING_ROOM',
  PATIENT_CANCELLED = 'PATIENT_CANCELLED',
  PATIENT_RESCHEDULED_REQUEST = 'PATIENT_RESCHEDULED_REQUEST',
  CALL_STARTED = 'CALL_STARTED',
  CALL_ENDED = 'CALL_ENDED',
  PATIENT_WAITING = 'PATIENT_WAITING',
  CALL_REMINDER = 'CALL_REMINDER',
}

export interface INotification extends Document {
  userId?: string;
  doctorId?: string;
  bookingId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: String, index: true },
  doctorId: { type: String, index: true },
  bookingId: { type: String, index: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model<INotification>('Notification', notificationSchema);