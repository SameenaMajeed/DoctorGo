import { HttpStatus } from "../../constants/Httpstatus";
import { IAdminRepository } from "../../interfaces/admin/adminRepositoryInterface";
import { IAdminService } from "../../interfaces/admin/adminServiceInterface";
import { IDoctorRepository } from "../../interfaces/doctor/doctorRepositoryInterface";
import { IUserRepositoryInterface } from "../../interfaces/user/UserRepositoryInterface";
import { IDoctor } from "../../models/doctorMpdel/DoctorModel";
import { AppError } from "../../utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt";

class AdminService implements IAdminService {
  constructor(
    private _adminRepository: IAdminRepository,
    private _userRepository: IUserRepositoryInterface,
    private _doctorRepository : IDoctorRepository
  ) {}

  async adminLogin(
    email: string,
    password: string
  ): Promise<{ admin: any; accessToken: string; refreshToken: string }> {
    const admin = await this._adminRepository.findByEmail(email);

    if (!admin) {
      throw new Error("Admin not found");
    }
    if (password !== admin.password) {
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken({
      id: admin._id.toString(),
      role: "admin",
    });
    const refreshToken = generateRefreshToken({
      id: admin._id.toString(),
      role: "admin",
    });

    return { admin, accessToken, refreshToken };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyToken(refreshToken);

      // Check for the expected property "id" in the payload
      if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        throw new Error("Invalid or malformed token");
      }

      // Generate a new access token using the decoded token's id and role "admin"
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        role: "admin",
      });
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error("Failed to refresh tokens");
    }
  }

  async updateDoctorStatus(doctorId: string, isBlocked: boolean, blockReason?: string): Promise<any> {
    return await this._doctorRepository.updateDoctorStatus(doctorId, isBlocked, blockReason);
  }

  async getPendingDoctors(page: number, limit: number, searchTerm: string): Promise<{ doctors: any[]; total: number; }> {
    const skip = (page - 1) * limit;

    const filter: any = { verificationStatus: "pending" };
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }
  
  // const filter: any = { 
  //     isBlocked: true,
  //     $or: [
  //         { name: { $regex: searchTerm, $options: 'i' } },
  //         { email: { $regex: searchTerm, $options: 'i' } }
  //     ]
  // };

  const [doctors , total ] = await Promise.all([
    this._doctorRepository.findAllPending(filter, skip, limit),
    this._doctorRepository.countAll(filter)
  ])

  return { doctors, total}
  }

  async updateDoctorVerificationStatus(
    doctorId: string,
    status: "approved" | "rejected",
    notes?: string
  ): Promise<IDoctor | null> {
    return this._doctorRepository.updateVerificationStatus(doctorId, status, notes);
  }

  async getAllDoctors(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ doctors: any[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }
    if (isBlocked === "blocked") {
      filter.isBlocked = true;
    } else if (isBlocked === "active") {
      filter.isBlocked = false;
    }

    const [doctors, total] = await Promise.all([
      this._doctorRepository.findAll(filter, skip, limit),
      this._doctorRepository.countAll(filter),
    ]);

    return { doctors, total };
  }

  async getAllUsers(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ users: any[]; total: number }> {
    const skip = (page - 1) * limit;
    // Build filter query
    const filter: any = {};
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ];
    }
    if (isBlocked === "blocked") {
      filter.isBlocked = true;
    } else if (isBlocked === "active") {
      filter.isBlocked = false;
    }

    const [users , total] = await Promise.all([
      this._userRepository.findAll(filter , skip , limit),
      this._userRepository.countAll(filter)
    ])
    return {users , total}
  }


  async doctorBlock(doctorId: string, isBlocked: boolean): Promise<any> {
    const doctor = await this._doctorRepository.findById(doctorId)

    if(!doctor){
      throw new Error("Doctor not found")
    }

    doctor.isBlocked = isBlocked;
    const updatedDoctor = await this._doctorRepository.save(doctor)

    return updatedDoctor;

  }

  async userBlock(userId: string, isBlocked: boolean): Promise<any> {
    try {
      const user = await this._userRepository.findById(userId);
      console.log("Before Update - isBlocked:", user?.isBlocked);
      if (!user) {
        throw new Error("User not found");
      }
      console.log('User is blocking boolean:', isBlocked);
      user.isBlocked = isBlocked;
      const updatedUser = await this._userRepository.save(user);
      console.log("After Update - isBlocked:", updatedUser?.isBlocked);
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getDoctorById(doctorId: string): Promise<IDoctor> {
      const doctor = await this._doctorRepository.findById(doctorId);
  
      if (!doctor) {
        throw new AppError(HttpStatus.NotFound, "Doctor not found");
      }
  
      return doctor;
    }
}

export default AdminService;
