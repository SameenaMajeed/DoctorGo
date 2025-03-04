import express, { Router } from "express";
import upload from "../middlewares/multer";
import { authenticateToken } from "../middlewares/authentication";
import { DoctorController } from "../controllers/doctorController";
import { DoctorService } from "../services/doctorService";
import { DoctorRepository } from "../repositories/doctorRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { checkApproved } from "../middlewares/checkApproved";
import { EmailVerificationController } from "../controllers/emailVerification";

const otpRepository = new OtpRepository();
const doctorRepository = new DoctorRepository();

const doctorService = new DoctorService(doctorRepository, otpRepository);

const doctorController = new DoctorController(doctorService);

const doctorRoute: Router = express.Router();

doctorRoute.post("/signup", (req, res) => {
  doctorController.registerDoctor(req, res);
});

doctorRoute.post("/login", (req, res) => {
  doctorController.loginDoctor(req, res);
});

doctorRoute.post("/refresh-token", (req, res) => {
  doctorController.refreshAccessToken(req, res);
});

// doctorRoute.post("/approve/:id", doctorController.approveDoctor.bind(doctorController)); 

doctorRoute.get("/profile/:id", authenticateToken("doctor"), (req, res) =>
  doctorController.getProfile(req, res)
);

doctorRoute.put("/updateProfile/:id", authenticateToken("doctor"), (req, res) =>
  doctorController.updateProfile(req, res)
);

doctorRoute.post("/logout", (req, res) => {
  doctorController.logout(req, res);
});


doctorRoute.post("/send-otp",(req, res) => {
   EmailVerificationController.sendVerificationOTP(req, res);
  });
doctorRoute.post("/verify-otp",(req, res) => { 
  console.log("Request Body:", req.body);
  EmailVerificationController.verifyOTPAndChangeEmail(req, res);
});

export default doctorRoute;
