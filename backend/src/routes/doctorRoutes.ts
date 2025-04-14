import express, { Router } from "express";
import upload from "../middlewares/multer";
import { authenticateToken } from "../middlewares/authentication";
import { DoctorController } from "../controllers/doctorController";
import { DoctorService } from "../services/doctorService";
import { DoctorRepository } from "../repositories/doctorRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { checkApproved } from "../middlewares/checkApproved";
import { EmailVerificationController } from "../controllers/emailVerification";
import { BookingRepository } from "../repositories/BookingRepository";
import { BookingService } from "../services/BookingService";
import { UserRepository } from "../repositories/userRepository";
import { BookingController } from "../controllers/BookingController";
import { PaymentService } from "../services/PaymentService";
import blockedUserMiddleware from "../middlewares/blockedUserMiddleware";
import SlotRepository from "../repositories/SlotRepository";
// import { uploadCertifications } from '../middlewares/fileUpload';

const otpRepository = new OtpRepository();
const doctorRepository = new DoctorRepository();
const bookingRepository = new BookingRepository();
const userRepository = new UserRepository();
const slotRepository = new SlotRepository();

const bookingService = new BookingService(
  bookingRepository,
  doctorRepository,
  userRepository,
  slotRepository
);

const paymentService = new PaymentService();

const bookingController = new BookingController(bookingService, paymentService);

const doctorService = new DoctorService(doctorRepository, otpRepository);

const doctorController = new DoctorController(doctorService);

const doctorRoute: Router = express.Router();

doctorRoute.post("/signup", upload.single("certificationFile"), (req, res) => {
  doctorController.registerDoctor(req, res);
});

doctorRoute.post("/login",blockedUserMiddleware, (req, res) => {
  doctorController.loginDoctor(req, res);
});

doctorRoute.post("/refresh-token", (req, res) => {
  doctorController.refreshAccessToken(req, res);
});

doctorRoute.get("/profile/:id",blockedUserMiddleware,
  authenticateToken("doctor"), (req, res) =>
  doctorController.getProfile(req, res)
);
doctorRoute.put("/updateProfile/:id",
  authenticateToken("doctor"), (req, res) =>
  doctorController.updateProfile(req, res)
);
doctorRoute.post(
  "/uploadProfilePicture",
  authenticateToken("doctor"),
  upload.single("profilePicture"),
  (req, res) => doctorController.uploadProfilePicture(req, res)
);
doctorRoute.post("/logout", (req, res) => doctorController.logout(req, res));

doctorRoute.post("/send-otp", (req, res) => {
  EmailVerificationController.sendVerificationOTP(req, res);
});
doctorRoute.post("/verify-otp", (req, res) => {
  console.log("Request Body:", req.body);
  EmailVerificationController.verifyOTPAndChangeEmail(req, res);
});

doctorRoute.get(
  "/:doctorId/appointments",
  blockedUserMiddleware,
  authenticateToken("doctor"),
  (req, res) => bookingController.getDoctorBooking(req, res)
);
doctorRoute.put(
  "/appointments/:appointmentId/status",
  blockedUserMiddleware,
  authenticateToken("doctor"),
  (req, res) => bookingController.updateDoctorAppointmentStatus(req, res)
);

export default doctorRoute;
