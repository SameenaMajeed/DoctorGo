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
import { IDoctorService, ILoginResponse } from "../interfaces/doctor/doctorServiceInterface";
import { IDoctorRepository } from "../interfaces/doctor/doctorRepositoryInterface";

export class DoctorService implements IDoctorService {
  constructor(
    private doctorRepository: IDoctorRepository,
    private otpRepository: IOtpRepository
  ) {}

  async registerDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    const { name, email, password, phone ,qualification , specialization} = doctorData;
    console.log('doctorData : ',doctorData)

    // Validate required fields
    if (!name || !email || !password || !phone || !qualification || !specialization) {
      throw new Error(MessageConstants.FILE_NOT_UPLOADED);
    }

    // check for existing doctor
    const existingDoctor = await this.doctorRepository.findByEmail(email);
    if(existingDoctor){
        throw new Error(MessageConstants.USER_ALREADY_EXISTS)
    }

    // Hash password and create new doctor
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.doctorRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      qualification,
      specialization,
      isBlocked: true,
    })
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
    // if (doctor.isBlocked) {
    //     console.log("Blocked doctor detected:", doctor.email);
    //     throw new Error(
    //       JSON.stringify({
    //         code: MessageConstants.DOCTOR_BLOCKED,
    //         message: "Account Blocked",
    //         reason: doctor.blockReason || undefined,
    //       })
    //     );
    // }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      console.error("Invalid password for doctor:", email);
      throw new Error(MessageConstants.INVALID_PASSWORD);
    }

    // Generate JWT tokens
    const tokenPayload : any = {
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
      const decoded : any = verifyToken(refreshToken)
      if(!decoded || typeof decoded !== 'object'){
        throw new Error(MessageConstants.INVALID_REFRESH_TOKEN);
      }

      // Pass a payload object with id and role
    return { accessToken: generateAccessToken({ id: decoded.id, role: "Doctor" }) };
  }

  async getDoctorProfile(doctorId: string): Promise<IDoctor | null> {
    return this.doctorRepository.findById(doctorId)
  }

  async updatedDoctorProfile(doctorId: string, updatedData: Partial<IDoctor>): Promise<any> {
    const updatedDoctor = await this.doctorRepository.updateProfile(doctorId, updatedData);
    if(!updatedDoctor){
      return null
    }

    return {
      id : updatedDoctor._id.toString(),
      name : updatedDoctor.name,
      email : updatedDoctor.email,
      phone : updatedDoctor.phone,
      qualification : updatedDoctor.qualification,
      specialization : updatedDoctor.specialization,

    }
  }
}
