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
import { DashboardService } from "../../services/doctorService/DashboardService";
import { DoctorDashboardController } from "../../controllers/doctorController/doctorDashboardController";
// import { NotificationService } from "../../services/commonService/NotificationService";
import { NotificationRepository } from "../../repositories/commonRepository/NotificationRepository";
import { NotificationService } from "../../services/commonService/NotificationService";
import { NotificationController } from "../../controllers/commonController/NotificationController";
// import { NotificationController } from "../../controllers/commonController/NotificationController";
// import { uploadCertifications } from '../middlewares/fileUpload';

const otpRepository = new OtpRepository();
const doctorRepository = new DoctorRepository();
const bookingRepository = new BookingRepository();
const userRepository = new UserRepository();
const slotRepository = new SlotRepository();
const PrescriptionRepository = new prescriptionRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const bookingService = new BookingService(
  bookingRepository,
  doctorRepository,
  userRepository,
  slotRepository,
  notificationRepository
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

const dashboardService = new DashboardService(
  doctorRepository,
  userRepository,
  bookingRepository,
  PrescriptionRepository
);
const dashboardController = new DoctorDashboardController(
  doctorService,
  dashboardService
);

const notificationController = new NotificationController(notificationService);

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
doctorRoute.get(
  "/chats/users/:doctorId",
  authenticateToken("doctor"),
  (req, res) => chatController.getUsersWhoMessaged(req, res)
);

doctorRoute.post(
  "/create-video-call-room",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => bookingController.createVideoCallRoom(req, res)
);

doctorRoute.get(
  "/:doctorId/dashboard-stats",
  authenticateToken("doctor"),
  (req, res) => dashboardController.getDashboardStats(req, res)
);

doctorRoute.get(
  "/appointments/today",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => bookingController.getTodaysAppointments(req, res)
);

// notification
doctorRoute.get(
  "/notifications",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req , res) => notificationController.getNotifications(req , res)
);
doctorRoute.patch(
  '/notifications/:notificationId/read',
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req , res) => notificationController.markAsRead(req , res)
);
export default doctorRoute;
