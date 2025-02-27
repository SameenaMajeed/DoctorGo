import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IDoctor extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  image : string;
  qualification: string;
  isBlocked: boolean;
  bio: string;
  ticketPrice: number;
  role: string;
  specialization: string;
  timeSlot: string;
  extraCharged: string[];
  onlineTimeSlot: string[];
  experience: string;
  reviews: mongoose.Types.ObjectId[];
  appointments: mongoose.Types.ObjectId[];
  ratings: number[];
  activeStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    qualification: { type: String, required: true },
    image: { type: String  },
    isBlocked: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    ticketPrice: { type: Number,},
    role: { type: String},
    specialization: { type: String, required: true },
    timeSlot: { type: String},
    extraCharged: [{ type: String }],
    onlineTimeSlot: [{ type: String }],
    experience: { type: String},
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    appointments: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    ratings: [{ type: Number }],
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default DoctorModel;
