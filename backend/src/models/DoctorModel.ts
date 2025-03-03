import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IDoctor extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  image: string;
  qualification: string;
  isBlocked: boolean;
  specialization: string;
  // registrationNumber: string; 
  // certificates: string[]; 
  // isApproved: boolean; 
}

const DoctorSchema: Schema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    qualification: { type: String, required: true },
    image: { type: String },
    isBlocked: { type: Boolean, default: false },
    // specialization: { type: String, required: true },
    // registrationNumber: { type: String, required: true, unique: true },
    // certificates: [{ type: String, required: true }], 
    // isApproved: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default DoctorModel;
