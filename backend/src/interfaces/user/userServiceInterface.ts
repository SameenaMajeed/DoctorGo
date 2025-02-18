import { IUser } from '../../models/userModel';
import { googleUserData } from '../../types/google';
 import { ForgotPasswordResponse } from '../../services/userServices'

export interface IUserService {
 
  registerUser(
    name: string,
    email: string,
    password: string,
    mobile_no: string,
  ): Promise<IUser>;

   
  authenticateUser(
    email: string,
    password: string,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;

 
//   googleSignIn(
//     userData: googleUserData,
//   ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
 
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;

 
  forgotPasswordVerify(email: string): Promise<ForgotPasswordResponse>;

 
  resetPassword(
    email: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }>;
  
  
}