import { IEmailVerification } from "../../models/commonModel/EmailVerification";

export interface IEmailVerificationRepository {
    createVerificationOTP(doctorId: string, oldEmail: string, newEmail: string, hashedOtp: string): Promise<IEmailVerification>;
    findByOTP(otp: string): Promise<IEmailVerification | null>;
    deleteOTP(otp: string): Promise<void>;
    findByDoctorId(doctorId: string): Promise<IEmailVerification | null>;
}