import { IEmailVerificationService } from "../interfaces/Email/EmailVerificationService";
import { IEmailVerificationRepository } from "../interfaces/Email/EmailVerificationRepository";
import Doctor from "../models/DoctorModel";
import { sentMail } from "../utils/SendMail";
import { generateOtp, hashOtp, compareOtps } from "../utils/GenerateOtp";

export class EmailVerificationService implements IEmailVerificationService {
  private emailRepository: IEmailVerificationRepository;

  constructor(emailRepository: IEmailVerificationRepository) {
    this.emailRepository = emailRepository;
  }

  async sendVerificationOTP(
    doctorId: string,
    newEmail: string
  ): Promise<{ message: string }> {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

    const oldEmail = doctor.email;
    const otp = generateOtp(); // Generate OTP
    console.log('Otp generated for mail change:' , otp)
    const hashedOtp = await hashOtp(otp); // Hash OTP

    // Store hashed OTP in DB
    await this.emailRepository.createVerificationOTP(
      doctorId,
      oldEmail,
      newEmail,
      hashedOtp
    );

    await sentMail(oldEmail, "Email Change Verification", `Your OTP: ${otp}`);

    return { message: "OTP sent to your current email" };
  }

  async verifyOTPAndChangeEmail(doctorId: string, otp: string): Promise<{ message: string }> {
    const verificationData = await this.emailRepository.findByOTP(otp);
   
    if (!verificationData) throw new Error("Invalid or expired OTP");

    // Compare user-provided OTP with stored hashed OTP
    const isValid = await compareOtps(otp, verificationData.otp);
    if (!isValid) throw new Error("Invalid OTP");

    await Doctor.findByIdAndUpdate(verificationData.doctorId, {
      email: verificationData.newEmail,
    });
    await this.emailRepository.deleteOTP(otp);

    return { message: "Email updated successfully" };
  }
}
