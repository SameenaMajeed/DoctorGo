import { IUser } from '../models/userModel';
import { Signup } from '../interfaces/user/signUpInterface';
import bcrypt from 'bcrypt';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken 
} from '../utils/jwt';
import { generateOtp, hashOtp } from '../utils/GenerateOtp';
import { sentMail } from '../utils/SendMail';
import { IUserService } from '../interfaces/user/userServiceInterface';
import { UserRepositoryInterface } from '../interfaces/user/UserRepositoryInterface';
import { OtpRepository } from '../repositories/otpRepository';
import { IDoctor } from '../models/DoctorModel';
import { DoctorRepository } from '../repositories/doctorRepository';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/Httpstatus';
import { MessageConstants } from '../constants/MessageConstants';
import { googleUserData } from '../types/google';

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: string | null;
}

export class UserService implements IUserService {
  constructor(
    private userRepository: UserRepositoryInterface,
    private otpRepository: OtpRepository,
    private doctorRepository : DoctorRepository,
  ) {}

  async registerUser(
    name: string,
    email: string,
    password: string,
    mobile_no: string
  ): Promise<IUser> {
    console.log('Register: Checking if user exists for email:', email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      console.log('Register: User already exists for email:', email);
      throw new Error('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Register: Hashed password generated for user.');

    const userData: Signup = {
      name,
      email,
      password: hashedPassword,
      mobile_no,
      is_verified: false,
      is_blocked: false,
    };

    console.log('Register: Creating new user with data:', userData);
    return await this.userRepository.create(userData);
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      console.log('Login: User not found for email:', email);
      throw new Error('User not found');
    }

    const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isPasswordValid) {
      console.log('Login: Invalid password for email:', email);
      throw new Error('Wrong Password');
    }

    const payload = {
      id : user._id.toString(),
      role : 'user' , 
      email : user.email
    }

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { user, accessToken, refreshToken };
  }

  async googleSignIn(userData: googleUserData): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email)
    if (existingUser) {
      const accessToken = generateAccessToken({ id: existingUser._id.toString(), role: 'user', email: existingUser.email });
      const refreshToken = generateRefreshToken({ id: existingUser._id.toString(), role: 'user' });
      return { user: existingUser, accessToken, refreshToken }
    }

    const newUser = await this.userRepository.create({
      email: userData.email,
      name: userData.name || 'Unknown',
      mobile_no: '',
      google_id: userData.uid,
      is_verified: true,
      isBlocked: false,
    });
    const accessToken = generateAccessToken({ id: newUser._id.toString(), role: 'user', email: newUser.email });
    const refreshToken = generateRefreshToken({ id: newUser._id.toString(), role: 'user' });
    return { user: newUser, accessToken, refreshToken };
  } 

  async refreshAccessToken(refreshToken: string) {
    try {
      console.log('Verifying refresh token:', refreshToken);
      const decoded = verifyToken(refreshToken);

      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        console.warn('Invalid or malformed token:', decoded);
        throw new Error('Invalid token');
      }

      const { id: userId, role } = decoded;
      console.log('Generating new access token for user ID:', userId);
      const newAccessToken = generateAccessToken({id : userId, role});

      return { accessToken: newAccessToken };
    } catch (error) {
      console.error('Error verifying refresh token:', error);
      throw new Error('Failed to refresh tokens');
    }
  }

  async forgotPasswordVerify(email: string): Promise<ForgotPasswordResponse> {
    try {
      const userData = await this.userRepository.findByEmail(email);
      if (!userData) {
        return { success: false, message: 'Mail not registered', data: null };
      }

      const otp = generateOtp();
      console.log('Generated otp:' , otp)
      const mailSent = await sentMail(
        email,
        'Forgot Password Verification',
        `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p><p>This code expires in <b>2 Minutes</b></p>`
      );

      if (mailSent) {
        const hashedOtp = await hashOtp(otp);
        await this.otpRepository.storeOtp(hashedOtp, userData.email);
      }

      return { success: true, message: 'Mail sent successfully', data: userData.email };
    } catch (error) {
      console.error('Error in forgotPasswordVerify:', error);
      return { success: false, message: 'Couldn’t verify mail', data: null };
    }
  }

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    console.log(`resetPassword called with email: ${email}`);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return { success: false, message: 'User not found' };
    }

    console.log(`User found: ${user.email}. Proceeding to hash the new password.`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`Password hashed successfully for email: ${email}`);

    try {
      await this.userRepository.updatePassword(user.id, hashedPassword);
      console.log(`Password updated successfully for email: ${email}`);
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error(`Error updating password for email: ${email}`, error);
      return { success: false, message: 'Error updating password. Please try again.' };
    }
  }


  async getAllDoctors(): Promise<{doctors : IDoctor[] }>{
    try {
      const doctors = await this.doctorRepository.findAllDoctor()

      return {doctors};
      
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getDoctorById(doctorId: string) : Promise<IDoctor>{
    const doctor = await this.doctorRepository.findById(doctorId);

    if (!doctor) {
      throw new AppError(HttpStatus.NotFound, "Doctor not found");
    }

    return doctor;
  }

}