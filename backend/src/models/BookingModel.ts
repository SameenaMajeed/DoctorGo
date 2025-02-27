import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IBooking extends Document {
  _id: ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  session: string;
  modeOfAppointment: string;
  is_paid: boolean;
  status: string;
  ticketPrice: string;
  appointmentDate: string;
  appointmentTime: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    session: { type: String, required: true },
    modeOfAppointment: { type: String, required: true },
    is_paid: { type: Boolean, default: false },
    status: { type: String, required: true },
    ticketPrice: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: Date, required: true },
    cancellationReason: { type: String, default: null },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
