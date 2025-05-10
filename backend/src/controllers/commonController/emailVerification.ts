import { Request, Response } from "express";
import { EmailVerificationService } from "../../services/commonService/emailVerification";
import EmailVerificationRepository from "../../repositories/commonRepository/emailVerification";

const EmailRepository = new EmailVerificationRepository();
const service = new EmailVerificationService(EmailRepository);

export class EmailVerificationController {
  static async sendVerificationOTP(req: Request, res: Response) {
    try {
      const { doctorId, newEmail } = req.body;
      console.log("Extracted newEmail:", newEmail);
      console.log("Extracted doctorId:", doctorId);
      const response = await service.sendVerificationOTP(doctorId, newEmail);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async verifyOTPAndChangeEmail(req: Request, res: Response) {
    try {
      const { doctorId, otp } = req.body;
      const response = await service.verifyOTPAndChangeEmail(doctorId, otp);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
