import express, { Router } from "express";
import upload from "../middlewares/multer";
import { authenticateToken } from "../middlewares/authentication";
import { DoctorController } from "../controllers/doctorController";
import { DoctorService } from "../services/doctorService";
import { DoctorRepository } from "../repositories/doctorRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { checkApproved } from "../middlewares/checkApproved";

const otpRepository = new OtpRepository();
const doctorRepository = new DoctorRepository();

const doctorService = new DoctorService(doctorRepository, otpRepository);

const doctorController = new DoctorController(doctorService);

const doctorRoute: Router = express.Router();

doctorRoute.post("/signup", upload.array("certificates"), (req, res) => {
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

export default doctorRoute;
