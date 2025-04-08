import { IDoctor } from "../../models/DoctorModel";

export interface IAdminService {
  adminLogin(
    email: string,
    password: string
  ): Promise<{ admin: any; accessToken: string; refreshToken: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;

  getPendingDoctors(page : number ,  limit: number , searchTerm: string): Promise<{ doctors: any[]; total: number }>;

  updateDoctorVerificationStatus(
      doctorId: string,
      status: "approved" | "rejected",
      notes?: string
    ): Promise<IDoctor | null> 

  updateDoctorStatus(doctorId: string, isBlocked: boolean,  blockReason?: string) : Promise<any>;

  getAllDoctors(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ doctors: any[]; total: number }>;

  getAllUsers(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ users: any[]; total: number }>;

  doctorBlock(doctorId: string, isBlocked: boolean): Promise<any>;
  userBlock(userId: string, isBlocked: boolean): Promise<any>;
}
