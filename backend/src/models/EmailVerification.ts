import mongoose, { Schema, Document } from "mongoose";

export interface IEmailVerification extends Document{
    doctorId: mongoose.Schema.Types.ObjectId;
    oldEmail: string;
    newEmail: string;
    otp: string;
    expiresAt: Date;
}

const  emailVerificationSchema = new Schema<IEmailVerification>({
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    oldEmail: { type: String, required: true },
    newEmail: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, default: () => Date.now() + 600000 }, // 10 min expiry
})

emailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

export const EmailOtp =  mongoose.model<IEmailVerification>(
    "EmailVerification",
    emailVerificationSchema
);