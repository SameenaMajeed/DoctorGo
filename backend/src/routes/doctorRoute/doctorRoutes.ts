import express, { Router } from "express";
import upload from "../../middlewares/multer";
import { authenticateToken } from "../../middlewares/authentication";
import { DoctorController } from "../../controllers/doctorController/doctorController";
import { DoctorService } from "../../services/doctorService/doctorService";
import { DoctorRepository } from "../../repositories/doctorRepository/doctorRepository";
import { OtpRepository } from "../../repositories/commonRepository/otpRepository";
import { checkApproved } from "../../middlewares/checkApproved";
import { EmailVerificationController } from "../../controllers/commonController/emailVerification";
import { BookingRepository } from "../../repositories/commonRepository/BookingRepository";
import { BookingService } from "../../services/commonService/BookingService";
import { UserRepository } from "../../repositories/userRepository/userRepository";
import { BookingController } from "../../controllers/commonController/BookingController";
import { PaymentService } from "../../services/commonService/PaymentService";
import SlotRepository from "../../repositories/commonRepository/SlotRepository";
import blockedDoctorMiddleware from "../../middlewares/blockedDoctorMiddleware";
import prescriptionRepository from "../../repositories/commonRepository/prescriptionRepository";
import PrescriptionService from "../../services/commonService/prescriptionService";
import PrescriptionController from "../../controllers/commonController/prescriptionController";
import { ChatController } from "../../controllers/commonController/chatController";
// import { uploadCertifications } from '../middlewares/fileUpload';

const otpRepository = new OtpRepository();
const doctorRepository = new DoctorRepository();
const bookingRepository = new BookingRepository();
const userRepository = new UserRepository();
const slotRepository = new SlotRepository();
const PrescriptionRepository = new prescriptionRepository();

const bookingService = new BookingService(
  bookingRepository,
  doctorRepository,
  userRepository,
  slotRepository
);

const prescriptionService = new PrescriptionService(
  PrescriptionRepository,
  doctorRepository,
  userRepository
);

const paymentService = new PaymentService();

const bookingController = new BookingController(bookingService, paymentService);

const doctorService = new DoctorService(doctorRepository, otpRepository);

const doctorController = new DoctorController(doctorService);

const prescriptionController = new PrescriptionController(prescriptionService);

const chatController = new ChatController();

const doctorRoute: Router = express.Router();

doctorRoute.post("/signup", upload.single("certificationFile"), (req, res) => {
  doctorController.registerDoctor(req, res);
});

doctorRoute.post("/login", blockedDoctorMiddleware, (req, res) => {
  doctorController.loginDoctor(req, res);
});

doctorRoute.post("/refresh-token", (req, res) => {
  doctorController.refreshAccessToken(req, res);
});

doctorRoute.get(
  "/profile/:id",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => doctorController.getProfile(req, res)
);
doctorRoute.put("/updateProfile/:id", authenticateToken("doctor"), (req, res) =>
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
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => bookingController.getDoctorBooking(req, res)
);
doctorRoute.put(
  "/appointments/:appointmentId/status",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => bookingController.updateDoctorAppointmentStatus(req, res)
);

// get Booked Users
doctorRoute.get(
  "/:doctorId/patients",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => bookingController.getPatients(req, res)
);

// Prescription
doctorRoute.post("/createPrescription", (req, res) =>
  prescriptionController.createPrescription(req, res)
);
doctorRoute.get("/allPrescriptions", (req, res) =>
  prescriptionController.getAllPrescriptions(req, res)
);

// chat
doctorRoute.get('/chats/users/:doctorId', authenticateToken('doctor'), (req, res) => chatController.getUsersWhoMessaged(req, res));

export default doctorRoute;
