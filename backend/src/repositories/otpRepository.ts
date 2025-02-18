import { otp as OtpModel, IOtp } from '../models/otpModel';
import IOtpRepository from '../interfaces/otp/otpRepositoryInterface';

export class OtpRepository implements IOtpRepository {
  async storeOtp(otp: string, email: string): Promise<boolean> {
    try {
      
      await OtpModel.deleteMany({ email });
      const newOtp = new OtpModel({ email, otp });
      await newOtp.save();
      return true;
    } catch (error: any) {
      console.log(error.message);
      return false;
    }
  }

  async findOtp(email: string): Promise<IOtp | null> {
    try {
      return await OtpModel.findOne({ email }).sort({ createdAt: -1 });
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
  }
}