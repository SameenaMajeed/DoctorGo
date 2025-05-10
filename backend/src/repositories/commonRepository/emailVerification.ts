import { IEmailVerificationRepository } from "../../interfaces/Email/EmailVerificationRepository";
import {
  EmailOtp as EmailVerificationModel,
  IEmailVerification,
} from "../../models/commonModel/EmailVerification";
import { compareOtps } from "../../utils/GenerateOtp";

class EmailVerificationRepository implements IEmailVerificationRepository {
  async createVerificationOTP(
    doctorId: string,
    oldEmail: string,
    newEmail: string,
    hashedOtp: string
  ): Promise<IEmailVerification> {
    const otpEntry = await EmailVerificationModel.create({
      doctorId,
      oldEmail,
      newEmail,
      otp: hashedOtp,
    });
    return otpEntry;
  }

  async findByOTP(otp: string): Promise<IEmailVerification | null> {
    console.log("Searching for OTP:", otp);

    // Retrieve the latest OTP record
    const verificationData = await EmailVerificationModel.findOne().sort({
      createdAt: -1,
    });

    if (!verificationData) {
      console.log("No OTP found.");
      return null;
    }

    console.log("Found OTP Data:", verificationData);

    // Compare entered OTP with the hashed OTP using bcrypt
    const isMatch = await compareOtps(otp, verificationData.otp);

    if (!isMatch) {
      console.log("OTP does not match.");
      return null;
    }

    console.log("OTP matched successfully!");
    return verificationData;
  }

  async deleteOTP(otp: string): Promise<void> {
    await EmailVerificationModel.deleteOne({ otp });
  }

  async findByDoctorId(doctorId: string): Promise<IEmailVerification | null> {
    return await EmailVerificationModel.findOne({ doctorId });
  }
}

export default EmailVerificationRepository;
