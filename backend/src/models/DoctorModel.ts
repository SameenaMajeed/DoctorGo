import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IDoctor extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  profilePicture: string;
  qualification: string;
  isBlocked: boolean;
  specialization: string;
  registrationNumber: string; 
  certificate: string;
  isApproved: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  blockReason?: string;
  submittedAt: Date;
  verifiedAt?: Date;
  bio: string;
  ticketPrice : number;
  extraCharge : number;
  experience : number
}

const DoctorSchema: Schema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    qualification: { type: String, required: true },
    profilePicture: { type: String },
    isBlocked: { type: Boolean, default: false },
    specialization: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    certificate: { type: String, required: true },
    bio: { type: String},
    experience: { type: Number},
    ticketPrice: { type: Number},
    extraCharge: { type:  Number},
    isApproved: { type: Boolean, default: false },
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    blockReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date }
  },
  { timestamps: true }
);

const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default DoctorModel;

