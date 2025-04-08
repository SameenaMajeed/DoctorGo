import bcrypt from "bcrypt";
import { IDoctor } from "../models/DoctorModel";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwt";
import { generateOtp, hashOtp } from "../utils/GenerateOtp";
import { sentMail } from "../utils/SendMail";
import { MessageConstants } from "../constants/MessageConstants";
import IOtpRepository from "../interfaces/otp/otpRepositoryInterface";
import { IDoctorService, ILoginResponse, PendingVerificationsResult } from "../interfaces/doctor/doctorServiceInterface";
import { IDoctorRepository } from "../interfaces/doctor/doctorRepositoryInterface";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/Httpstatus";
import cloudinary from "../config/cloudinary";
import { CloudinaryService } from "../utils/cloudinary.service";

export class DoctorService implements IDoctorService {
  constructor(
    private doctorRepository: IDoctorRepository,
    private otpRepository: IOtpRepository
  ) {}

  async registerDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    const { 
      name, 
      email, 
      password, 
      phone, 
      qualification, 
      specialization, 
      registrationNumber,
      certificate,
    } = doctorData;

    console.log('doctorData : ' ,doctorData)

    // Validate required fields
    if (!name || !email || !password || !phone || !qualification || !specialization || !registrationNumber ||!certificate) {
      throw new Error(MessageConstants.MISSING_REQUIRED_FIELDS);
    }

    // Check for existing doctor by email
    const existingDoctor = await this.doctorRepository.findByEmail(email);
    if (existingDoctor) {
      throw new Error(MessageConstants.USER_ALREADY_EXISTS);
    }

    // Check for existing registration number
    const existingRegistration = await this.doctorRepository.findByRegistrationNumber(registrationNumber as string);
    if (existingRegistration) {
      throw new Error("Registration number already exists");
    }

    // Hash password and create new doctor
    const hashedPassword = await bcrypt.hash(password as string, 10);
    return this.doctorRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      qualification,
      specialization,
      registrationNumber,
      certificate,
      isBlocked: false, 
      isApproved: false,
      verificationStatus: 'pending',
      submittedAt: new Date(),
      ticketPrice : 0,
      extraCharge : 0,
      bio : '',
      experience :0 ,
    });
  }

  async loginDoctor(email: string, password: string): Promise<ILoginResponse> {
    console.log("Attempting login for doctor email:", email);

    // Find doctor by email
    const doctor = await this.doctorRepository.findByEmail(email);
    let role = "Doctor";

    if (!doctor) {
      console.error("Doctor not found");
      throw new Error(MessageConstants.LOGIN_FAILED);
    }

    // Check if doctor is blocked
    if (doctor.isBlocked) {
      console.log("Blocked doctor detected:", doctor.email);
      throw new Error(
        JSON.stringify({
          code: MessageConstants.DOCTOR_BLOCKED,
          message: "Account Blocked",
          reason: doctor.blockReason || undefined,
        })
      );
    }

    // // Check if doctor is approved
    // if (!doctor.isApproved) {
    //   console.log("Unapproved doctor attempted login:", doctor.email);
    //   throw new Error(
    //     JSON.stringify({
    //       code: MessageConstants. DOCTOR_NOT_VERIFIED,
    //       message: "Account Not Approved",
    //       status: doctor.verificationStatus
    //     })
    //   );
    // }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      console.error("Invalid password for doctor:", email);
      throw new Error(MessageConstants.INVALID_PASSWORD);
    }

    // Generate JWT tokens
    const tokenPayload: any = {
      id: doctor._id.toString(),
      role: "doctor",
      email: doctor.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      doctor,
      accessToken,
      refreshToken,
      role: "doctor",
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; }> {
    const decoded: any = verifyToken(refreshToken);
    if (!decoded || typeof decoded !== 'object') {
      throw new Error(MessageConstants.INVALID_REFRESH_TOKEN);
    }

    // Pass a payload object with id and role
    return { accessToken: generateAccessToken({ id: decoded.id, role: "Doctor" }) };
  }

  async getDoctorProfile(doctorId: string): Promise<IDoctor | null> {
    return this.doctorRepository.findById(doctorId);
  }

  async updatedDoctorProfile(doctorId: string, updatedData: Partial<IDoctor>): Promise<any> {
    // Don't allow updating verification status or certifications through this method
    const allowedUpdates = {
      name: updatedData.name,
      phone: updatedData.phone,
      qualification: updatedData.qualification,
      specialization: updatedData.specialization,
      image: updatedData.profilePicture,
      bio : updatedData.bio,
      ticketPrice : updatedData.ticketPrice,
      extraCharge : updatedData.extraCharge
    };

    const updatedDoctor = await this.doctorRepository.updateProfile(doctorId, allowedUpdates);
    if (!updatedDoctor) {
      return null;
    }

    return {
      id: updatedDoctor._id.toString(),
      name: updatedDoctor.name,
      email: updatedDoctor.email,
      phone: updatedDoctor.phone,
      qualification: updatedDoctor.qualification,
      specialization: updatedDoctor.specialization,
      profilePicture: updatedDoctor.image,
      registrationNumber: updatedDoctor.registrationNumber,
      verificationStatus: updatedDoctor.verificationStatus,
      bio : updatedData.bio,
      ticketPrice : updatedData.ticketPrice,
      extraCharge : updatedData.extraCharge,
      experience : updatedData.experience
    };
  }

  async uploadProfilePicture(doctorId: string, filePath: string): Promise<string> {
    try {
      const doctor = await this.doctorRepository.findById(doctorId)
      if (!doctor) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.DOCTOR_NOT_FOUND);
      }

      const result = await cloudinary.uploader.upload(filePath, {
        public_id: `doctor_${doctorId}`,
        overwrite: true,
        type: "authenticated", // Restrict access
      });

      const updatedDoctor = await this.doctorRepository.updateProfilePicture(doctorId, result.secure_url);

      if (!updatedDoctor) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.DOCTOR_NOT_FOUND);
      }

      // Return a signed URL instead of the default secure_url
      return CloudinaryService.generateSignedUrl(`user_${doctorId}`);

    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to upload profile picture");
    }
  }

  async verifyDoctor(doctorId: string, status: 'approved' | 'rejected', notes?: string): Promise<IDoctor | null> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new Error(MessageConstants.DOCTOR_NOT_FOUND);
    }

    const updatedDoctor = await this.doctorRepository.updateVerificationStatus(doctorId, status, notes);

    // If doctor is approved, unblock their account
    if (status === 'approved' && updatedDoctor) {
      await this.doctorRepository.updateDoctorStatus(doctorId, false);
      
      // Send approval email to doctor
      try {
        await sentMail(
          doctor.email,
          "Account Verification Approved",
          `Dear Dr. ${doctor.name},\n\nYour account has been verified and approved. You can now log in to our platform.\n\nThank you,\nThe Admin Team`
        );
      } catch (error) {
        console.error("Failed to send approval email:", error);
      }
    } else if (status === 'rejected' && updatedDoctor) {
      // Send rejection email with notes
      try {
        await sentMail(
          doctor.email,
          "Account Verification Rejected",
          `Dear Dr. ${doctor.name},\n\nWe regret to inform you that your account verification has been rejected.\n\nReason: ${notes || 'No specific reason provided.'}\n\nPlease contact our support team for further assistance.\n\nThank you,\nThe Admin Team`
        );
      } catch (error) {
        console.error("Failed to send rejection email:", error);
      }
    }

    return updatedDoctor;
  }

  async getPendingVerifications(page = 1, limit = 10): Promise<PendingVerificationsResult> {
    const skip = (page - 1) * limit;
    return {
      doctors: await this.doctorRepository.findAllPending({}, skip, limit),
      count: await this.doctorRepository.countAll({ verificationStatus: 'pending' }),
    };
  }
}

// import bcrypt from "bcrypt";
// import { IDoctor } from "../models/DoctorModel";
// import {
//   generateAccessToken,
//   generateRefreshToken,
//   verifyToken,
// } from "../utils/jwt";
// import { generateOtp, hashOtp } from "../utils/GenerateOtp";
// import { sentMail } from "../utils/SendMail";
// import { MessageConstants } from "../constants/MessageConstants";
// import IOtpRepository from "../interfaces/otp/otpRepositoryInterface";
// import { IDoctorService, ILoginResponse } from "../interfaces/doctor/doctorServiceInterface";
// import { IDoctorRepository } from "../interfaces/doctor/doctorRepositoryInterface";

// export class DoctorService implements IDoctorService {
//   constructor(
//     private doctorRepository: IDoctorRepository,
//     private otpRepository: IOtpRepository
//   ) {}

//   async registerDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
//     const { name, email, password, phone ,qualification , specialization} = doctorData;
//     console.log('doctorData : ',doctorData)

//     // Validate required fields
//     if (!name || !email || !password || !phone || !qualification || !specialization) {
//       throw new Error(MessageConstants.FILE_NOT_UPLOADED);
//     }

//     // check for existing doctor
//     const existingDoctor = await this.doctorRepository.findByEmail(email);
//     if(existingDoctor){
//         throw new Error(MessageConstants.USER_ALREADY_EXISTS)
//     }

//     // Hash password and create new doctor
//     const hashedPassword = await bcrypt.hash(password, 10);
//     return this.doctorRepository.create({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       qualification,
//       specialization,
//       isBlocked: true,
//     })
//   }

//   async loginDoctor(email: string, password: string): Promise<ILoginResponse> {
//     console.log("Attempting login for doctor email:", email);

//     // Find doctor by email
//     const doctor = await this.doctorRepository.findByEmail(email);
//     let role = "Doctor";

//     if (!doctor) {
//         console.error("Doctor not found");
//         throw new Error(MessageConstants.LOGIN_FAILED);
//     }

//     // Check if doctor is blocked
//     // if (doctor.isBlocked) {
//     //     console.log("Blocked doctor detected:", doctor.email);
//     //     throw new Error(
//     //       JSON.stringify({
//     //         code: MessageConstants.DOCTOR_BLOCKED,
//     //         message: "Account Blocked",
//     //         reason: doctor.blockReason || undefined,
//     //       })
//     //     );
//     // }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, doctor.password);
//     if (!isPasswordValid) {
//       console.error("Invalid password for doctor:", email);
//       throw new Error(MessageConstants.INVALID_PASSWORD);
//     }

//     // Generate JWT tokens
//     const tokenPayload : any = {
//         id: doctor._id.toString(),
//         role: "doctor",
//         email: doctor.email,
//     };

//     const accessToken = generateAccessToken(tokenPayload);
//     const refreshToken = generateRefreshToken(tokenPayload);

//     return {
//         doctor,
//         accessToken,
//         refreshToken,
//         role: "doctor",
//     };

//   }


//   async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; }> {
//       const decoded : any = verifyToken(refreshToken)
//       if(!decoded || typeof decoded !== 'object'){
//         throw new Error(MessageConstants.INVALID_REFRESH_TOKEN);
//       }

//       // Pass a payload object with id and role
//     return { accessToken: generateAccessToken({ id: decoded.id, role: "Doctor" }) };
//   }

//   async getDoctorProfile(doctorId: string): Promise<IDoctor | null> {
//     return this.doctorRepository.findById(doctorId)
//   }

//   async updatedDoctorProfile(doctorId: string, updatedData: Partial<IDoctor>): Promise<any> {
//     const updatedDoctor = await this.doctorRepository.updateProfile(doctorId, updatedData);
//     if(!updatedDoctor){
//       return null
//     }

//     return {
//       id : updatedDoctor._id.toString(),
//       name : updatedDoctor.name,
//       email : updatedDoctor.email,
//       phone : updatedDoctor.phone,
//       qualification : updatedDoctor.qualification,
//       specialization : updatedDoctor.specialization,

//     }
//   }
// }