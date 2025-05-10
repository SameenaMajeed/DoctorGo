import { Router } from "express";
import { EmailVerificationController } from "../../controllers/commonController/emailVerification";

const emailRoute = Router();

emailRoute.post("/send-otp", EmailVerificationController.sendVerificationOTP);
emailRoute.post("/verify-otp", EmailVerificationController.verifyOTPAndChangeEmail);

export default emailRoute;