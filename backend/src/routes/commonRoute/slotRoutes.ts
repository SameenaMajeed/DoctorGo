import express, { Router } from "express";
import SlotRepository from "../../repositories/commonRepository/SlotRepository";
import SlotService from "../../services/commonService/SlotService";
import SlotController from "../../controllers/commonController/SlotController";
import { authenticateToken } from "../../middlewares/authentication";
import blockedUserMiddleware from "../../middlewares/blockedUserMiddleware";
import blockedDoctorMiddleware from "../../middlewares/blockedDoctorMiddleware";

const slotRoute: Router = express.Router();

const slotRepository = new SlotRepository();
const slotService = new SlotService(slotRepository);
const slotController = new SlotController(slotService);

// Doctor-only routes
slotRoute.post(
  "/time-slots/create",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => slotController.createSlot(req, res)
);

slotRoute.get(
  "/time-slots/:doctorId",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => slotController.getAvailableSlots(req, res)
);

slotRoute.get(
  "/time-slots/edit/:slotId",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => {
    slotController.getSlot(req, res);
  }
);

slotRoute.put(
  "/time-slots/:slotId",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => slotController.updateSlot(req, res)
);

slotRoute.delete(
  "/time-slots/:slotId",
  authenticateToken("doctor"),
  blockedDoctorMiddleware,
  (req, res) => slotController.deleteSlot(req, res)
);

// User-accessible routes
slotRoute.get(
  "/time-slots/:doctorId/available",
  authenticateToken("user"),
  blockedUserMiddleware,
  (req, res) => slotController.getAvailableSlots(req, res)
);

slotRoute.put(
  "/time-slots/:slotId/book",
  authenticateToken("user"),
  (req, res) => slotController.bookSlot(req, res)
);

slotRoute.get(
  "/time-slots/:slotId/availability",
  authenticateToken("user"),
  blockedUserMiddleware,
  (req, res) => slotController.checkSlotAvailability(req, res)
);

export default slotRoute;
