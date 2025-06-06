import express, { Router, Request, Response } from "express";
import { Usercontroller } from "../../controllers/userController/userController";
import { authenticateToken } from "../../middlewares/authentication";
import { UserRepository } from "../../repositories/userRepository/userRepository";
import { UserService } from "../../services/userService/userServices";
import { OtpRepository } from "../../repositories/commonRepository/otpRepository";
import blockedUserMiddleware from "../../middlewares/blockedUserMiddleware";
import { DoctorRepository } from "../../repositories/doctorRepository/doctorRepository";
import { BookingService } from "../../services/commonService/BookingService";
import { BookingRepository } from "../../repositories/commonRepository/BookingRepository";
import { BookingController } from "../../controllers/commonController/BookingController";
import { DoctorController } from "../../controllers/doctorController/doctorController";
import { DoctorService } from "../../services/doctorService/doctorService";
import { PaymentService } from "../../services/commonService/PaymentService";
import SlotRepository from "../../repositories/commonRepository/SlotRepository";
import upload from "../../middlewares/multer";
import { ChatController } from "../../controllers/commonController/chatController";
import PrescriptionController from "../../controllers/commonController/prescriptionController";
import PrescriptionService from "../../services/commonService/prescriptionService";
import prescriptionRepository from "../../repositories/commonRepository/prescriptionRepository";
import { ReviewController } from "../../controllers/commonController/reviewController";
import ReviewService from "../../services/commonService/ReviewService";
import ReviewRepository from "../../repositories/commonRepository/ReviewRepository";
import { NotificationRepository } from "../../repositories/commonRepository/NotificationRepository";
import { NotificationController } from "../../controllers/commonController/NotificationController";
import { NotificationService } from "../../services/commonService/NotificationService";

const userRoute: Router = express.Router();
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const doctorRepository = new DoctorRepository();
const bookingRepository = new BookingRepository();
const slotRepository = new SlotRepository();
const PrescriptionRepository = new prescriptionRepository();
const reviewRepository = new ReviewRepository()
const notificationRepository = new NotificationRepository();

const userService = new UserService(
  userRepository,
  otpRepository,
  doctorRepository
);
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

const reviewService = new ReviewService(reviewRepository , bookingRepository)

const paymentService = new PaymentService();
// const doctorService = new DoctorService(doctorRepository, otpRepository);
const notificationService = new NotificationService(notificationRepository);

// const doctorController = new DoctorController(doctorService);
const userController = new Usercontroller(userService);
const bookingController = new BookingController(bookingService, paymentService);
const chatController = new ChatController();
const prescriptionController = new PrescriptionController(prescriptionService);
const reviewController = new ReviewController(reviewService)
const notificationController = new NotificationController(notificationService);


// User authentication routes
// Register user:
userRoute.post("/register", (req: Request, res: Response) => {
  userController.registerUser(req, res);
});

// User login:
userRoute.post(
  "/login",
  blockedUserMiddleware,
  (req: Request, res: Response) => {
    userController.signIn(req, res);
  }
);

// Google Sign-in
userRoute.post("/google", (req: Request, res: Response) => {
  userController.googleSignIn(req, res);
});

// Refresh access token
userRoute.post("/refresh-token", (req: Request, res: Response) => {
  userController.refreshAccessToken(req, res);
});

userRoute.post("/forgot-password", (req: Request, res: Response) => {
  userController.forgotPassword(req, res);
});

userRoute.post("/reset-password", (req: Request, res: Response) => {
  userController.resetPassword(req, res);
});

userRoute.post("/logout", (req, res) => userController.logout(req, res));

// User profile (using middleware for authentication)
userRoute.get(
  "/profile",
  authenticateToken("user"),
  blockedUserMiddleware,
  (req: Request, res: Response) => {
    userController.getProfile(req, res);
  }
);

userRoute.put("/updateProfile", authenticateToken("user"), (req, res) =>
  userController.updateProfile(req, res)
);

userRoute.put(
  "/uploadProfilePicture",
  authenticateToken("user"),
  upload.single("profilePicture"),
  (req: Request, res: Response) => {
    userController.uploadProfilePicture(req, res);
  }
);

// password reset
userRoute.post("/forgot-password", (req: Request, res: Response) => {
  userController.forgotPassword(req, res);
});

userRoute.post("/reset-password", (req: Request, res: Response) => {
  userController.resetPassword(req, res);
});

// Doctor related routes
userRoute.get(
  "/doctors",
  authenticateToken("user"),
  blockedUserMiddleware,
  (req: Request, res: Response) => {
    userController.getAllDoctors(req, res);
  }
);

userRoute.get("/doctors/:doctorId", authenticateToken("user"), (req, res) => {
  userController.fetchDoctor(req, res);
});

// Booking related routes
userRoute.post(
  "/bookings/create",
  authenticateToken("user"),
  (req: Request, res: Response) => {
    bookingController.createBooking(req, res);
  }
);

userRoute.get("/appointments/:id", authenticateToken("user"), (req, res) => {
  bookingController.getBooking(req, res);
});

userRoute.patch(
  "/appointments/:id/cancel",
  authenticateToken("user"),
  (req, res) => bookingController.cancelBooking(req, res)
);

// booking checks
userRoute.get("/bookings/user/:userId", authenticateToken("user"), (req, res) =>
  bookingController.getUserBookings(req, res)
);

userRoute.get("/bookings/check", authenticateToken("user"), (req, res) =>
  bookingController.checkUserBooking(req, res)
);

// Payment route
userRoute.post(
  "/payments/create-order",
  authenticateToken("user"),
  (req, res) => {
    bookingController.createPayment(req, res);
  }
);

// Chat route
userRoute.get(
  "/chats/doctors/:userId",
  authenticateToken("user"),
  blockedUserMiddleware,
  (req, res) => chatController.getDoctorsWhoMessaged(req, res)
);

// Prescription
userRoute.get("/prescriptions", authenticateToken("user"), (req, res) =>
  prescriptionController.listPrescriptions(req, res)
);
userRoute.get("/prescriptions/:prescriptionId/download",authenticateToken("user"), (req, res) =>
  prescriptionController.downloadPrescription(req, res)
);

userRoute.get("/prescription/:appointmentId", (req, res) =>prescriptionController.getPrescriptionByAppointment(req, res));


// Review
userRoute.post('/submitReview',authenticateToken("user"), (req, res) =>
  reviewController.addReview(req, res))

userRoute.get('/reviews/doctor/:doctorId',(req, res) =>
  reviewController.getReview(req, res))

userRoute.put("/updateReview/:id",authenticateToken("user"), (req, res) =>
  reviewController.updateReview(req, res));

// Check if user has already reviewed a doctor for a specific appointment
userRoute.get('/reviews/check', authenticateToken("user"), (req, res) =>
  reviewController.checkReview(req, res));

// Get a single review by ID
userRoute.get('/reviews/:id', authenticateToken("user"), (req, res) =>
  reviewController.getReviewById(req, res));

// notification
userRoute.get(
  "/notifications",
  authenticateToken("user"),
  blockedUserMiddleware,
  (req , res) => notificationController.getNotifications(req , res)
);
userRoute.patch(
  "/notifications/:notificationId/read",
  authenticateToken("user"),
  blockedUserMiddleware,
  (req , res) => notificationController.markAsRead(req , res)
);

export default userRoute;
