import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface IUser extends Document {
  isBlocked: boolean;
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  mobile_no: string;
  gender: string;
  role: string;
  google_id?: string;
  medical_History: string;
  DOB: string;
  url: string;
  address: string;
  is_verified: boolean;
  is_deleted: boolean;
  profilePicture: string;
  age: string;
}

const userSchema: Schema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    mobile_no: String,
    gender: String,
    role: String,
    medical_History: String,
    DOB: String,
    url: String,
    age: String,
    profilePicture: String,
    address: {
      type: String,
      default: "",
      trim: true,
    },
    google_id: { type: String },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model<IUser>("User", userSchema);

export default userModel;

export { IUser };
