
import { IOtp } from '../../models/commonModel/otpModel';
interface IOtpRepository {
  storeOtp(otp: string, email: string): Promise<boolean>;
  findOtp(email: string): Promise<IOtp | null>;
}

export default IOtpRepository;
