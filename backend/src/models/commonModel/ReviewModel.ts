import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface Review {
  doctor_id: string;
  user_id: string;
  appointment_id: string;
  reviewText: string;
  rating: number;
}

export interface IReview extends Document {
  _id: ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  appointment_id: mongoose.Types.ObjectId;
  reviewText: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewText: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);

export default ReviewModel;
