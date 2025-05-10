import { IUser } from "../../models/userModel/userModel";
import { googleUserData } from "../../types/google";
import { ForgotPasswordResponse } from "../../services/userService/userServices";
import { IDoctor } from "../../models/doctorMpdel/DoctorModel";

export interface IUserService {
  registerUser(
    name: string,
    email: string,
    password: string,
    mobile_no: string
  ): Promise<IUser>;

  authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;

  googleSignIn(
    userData: googleUserData
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;

  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;

  forgotPasswordVerify(email: string): Promise<ForgotPasswordResponse>;

  resetPassword(
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }>;

  getUserProfile(
    userId: string
  ): Promise<{
    id: string;
    name: string;
    email: string;
    mobile_no: string;
    age: string;
    address: string;
    DOB: string;
    gender: string;
    profilePicture: string;
  } | null>;

  uploadProfilePicture(userId: string, filePath: string): Promise<string>;

  updateUserProfile(
    userId: string,
    updateData: {
      name: string;
      email: string;
      mobile_no: string;  
      address: string;
      DOB: string;
      gender: string;
      age: string;
    }
  ): Promise<{
    id: string;
    name: string;
    email: string;
    mobile_no: string;
    address: string;
    DOB: string;
    gender: string;
    age: string;
    profilePicture: string;
  }>

  getAllDoctors(doctorId?: string): Promise<{ doctors: any[] }>;
  getDoctorById(doctorId: string): Promise<IDoctor>;
}
