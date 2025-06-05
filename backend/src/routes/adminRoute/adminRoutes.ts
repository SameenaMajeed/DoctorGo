import express, { Router, Request, Response } from "express";

import { authenticateToken } from "../../middlewares/authentication";

import AdminController from "../../controllers/adminController/adminController";
import AdminService from "../../services/adminService/AdminService";

import { AdminRepository } from "../../repositories/adminRepository/AdminRepositry";
import { DoctorRepository } from "../../repositories/doctorRepository/doctorRepository";
import { UserRepository } from "../../repositories/userRepository/userRepository";
import SlotRepository from "../../repositories/commonRepository/SlotRepository";
import { BookingRepository } from "../../repositories/commonRepository/BookingRepository";
import { BookingService } from "../../services/commonService/BookingService";
import { BookingController } from "../../controllers/commonController/BookingController";
import { PaymentService } from "../../services/commonService/PaymentService";
import { AdminDashboardRepository } from "../../repositories/adminRepository/AdminDashboardRepository";
import { AdminDashboardService } from "../../services/adminService/AdminDashboardService";
import { AdminDashboardController } from "../../controllers/adminController/AdminDashboardController";
import { NotificationRepository } from "../../repositories/commonRepository/NotificationRepository";

const adminRoute: Router = express.Router();

const doctorRepository = new DoctorRepository();
const userRepository = new UserRepository();
const adminRepository = new AdminRepository();
const bookingRepository = new BookingRepository();
const slotRepository = new SlotRepository();
const notificationRepository = new NotificationRepository();

const adminService = new AdminService(
  adminRepository,
  userRepository,
  doctorRepository
);
const adminController = new AdminController(adminService);

const bookingService = new BookingService(
  bookingRepository,
  doctorRepository,
  userRepository,
  slotRepository,
  notificationRepository
);

const paymentService = new PaymentService();

const adminDashboardRepository = new AdminDashboardRepository();
const adminDashboardService = new AdminDashboardService(
  adminDashboardRepository
);
const adminDashboardController = new AdminDashboardController(
  adminDashboardService
);

const bookingController = new BookingController(bookingService, paymentService);

adminRoute.post("/login", (req: Request, res: Response) => {
  adminController.login(req, res);
});
adminRoute.get(
  "/pending",
  authenticateToken("admin"),
  (req: Request, res: Response) => {
    adminController.getPendingDoctor(req, res);
  }
);

adminRoute.post(
  "/approve",
  authenticateToken("admin"),
  (req: Request, res: Response) => {
    adminController.updateDoctorVerificationStatus(req, res);
  }
);

// adminRoute.post('/update-status' , (req:Request,res:Response)=>{
//     adminController.updateDoctorStatus(req , res)
// })
adminRoute.post("/refresh-token", (req: Request, res: Response) => {
  adminController.refreshAccessToken(req, res);
});
adminRoute.post("/logout", (req: Request, res: Response) => {
  adminController.logout(req, res);
});
adminRoute.get(
  "/doctor",
  authenticateToken("admin"),
  (req: Request, res: Response) => {
    adminController.getAllDoctors(req, res);
  }
);
adminRoute.get(
  "/users",
  authenticateToken("admin"),
  (req: Request, res: Response) => {
    adminController.getAllUsers(req, res);
  }
);
adminRoute.post(
  "/block-doctor",
  authenticateToken("admin"),
  (req: Request, res: Response) => {
    adminController.blockDoctor(req, res);
  }
);
adminRoute.post(
  "/block-user",
  authenticateToken("admin"),
  (req: Request, res: Response) => {
    adminController.blockUser(req, res);
  }
);

adminRoute.get(
  "/bookings",
  authenticateToken("admin"),
  (req: Request, res: Response) => {
    bookingController.getAllBookings(req, res);
  }
);

// Dashboard Route
adminRoute.get("/dashboard", authenticateToken("admin"), (req, res) =>
  adminDashboardController.getDashboardData(req, res)
);

export default adminRoute;
