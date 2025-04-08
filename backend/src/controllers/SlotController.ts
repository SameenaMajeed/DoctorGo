import { Request, Response } from "express";
import { ISlotService } from "../interfaces/Slot/SlotServiceInterface";
import { sendError, sendResponse } from "../utils/responseUtils";
import { HttpStatus } from "../constants/Httpstatus";
import { MessageConstants } from "../constants/MessageConstants";
import { AppError } from "../utils/AppError";

export default class SlotController {
  constructor(private slotService: ISlotService) {}

  async createSlot(req: Request, res: Response) {
    try {
      const slotData = req.body;
      console.log("Controller received:", JSON.stringify(slotData, null, 2));

      // Validate maxPatients
      if (!slotData.maxPatients || slotData.maxPatients < 1) {
        return sendError(
          res,
          HttpStatus.BadRequest,
          "Maximum patients must be at least 1"
        );
      }

      // Restrict doctorId to authenticated doctor's ID if role is 'doctor'
      if (req.data?.role === "doctor" && slotData.doctorId !== req.data.id) {
        return sendError(
          res,
          HttpStatus.Forbidden,
          "Doctors can only create slots for themselves"
        );
      }

      const slot = await this.slotService.createSlot(slotData);
      sendResponse(
        res,
        HttpStatus.Created,
        MessageConstants.SLOT_CREATED,
        slot
      );
    } catch (error: any) {
      const status =
        error.message === "Start time must be before end time" ||
        error.message === "Frequency is required for recurring slots" ||
        error.message === "Recurring end date must be after start time" ||
        error.message === "Maximum patients must be at least 1"
          ? HttpStatus.BadRequest
          : HttpStatus.InternalServerError;

      sendError(
        res,
        status,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = (req.query.searchTerm as string) || "";

      if (!doctorId) {
        return sendError(res, HttpStatus.BadRequest, "Doctor ID is required");
      }

      const { slots, total } = await this.slotService.getAvailableSlots(
        doctorId,
        date as  string |undefined,
        page,
        limit,
        searchTerm
      );
      sendResponse(
        res,
        HttpStatus.OK,
        slots.length > 0 ? "Success" : "No available slots found",
        { slots, total }
      );
    } catch (error: any) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error("Error in getAvailableSlots:", error);
        sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
      }
    }
  }
  // async getAvailableSlots(req: Request, res: Response) {
  //   try {
  //     const { doctorId } = req.params;
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = parseInt(req.query.limit as string) || 10;
  //     const searchTerm = (req.query.searchTerm as string) || "";

  //     if (!doctorId) {
  //       return sendError(res, HttpStatus.BadRequest, "Doctor ID is required");
  //     }

  //     const { slots, total } = await this.slotService.getAvailableSlots(
  //       doctorId,
  //       page,
  //       limit,
  //       searchTerm
  //     );

  //     sendResponse(
  //       res,
  //       HttpStatus.OK,
  //       slots.length > 0 ? "Success" : "No available slots found",
  //       { slots, total } // Ensure `total` is included in the response
  //     );
  //   } catch (error: any) {
  //     sendError(res, HttpStatus.InternalServerError, error.message);
  //   }
  // }
  async bookSlot(req: Request, res: Response) {
    try {
      const slotId = req.params.slotId;
      if (!slotId) {
        return sendError(res, HttpStatus.BadRequest, "Slot ID is required");
      }

      const slot = await this.slotService.bookSlot(slotId);
      sendResponse(res, HttpStatus.OK, MessageConstants.SLOT_BOOKED, slot);
    } catch (error: any) {
      const status =
        error.message === "Slot not found"
          ? HttpStatus.NotFound
          : error.message === "Slot is fully booked" ||
            error.message === "Slot is blocked"
          ? HttpStatus.BadRequest
          : HttpStatus.InternalServerError;

      sendError(
        res,
        status,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const slotId = req.params.slotId;
      if (!slotId) {
        return sendError(res, HttpStatus.BadRequest, "Slot ID is required");
      }

      const slot = await this.slotService.cancelBooking(slotId);
      sendResponse(res, HttpStatus.OK, "Booking cancelled successfully", slot);
    } catch (error: any) {
      const status =
        error.message === "Slot not found"
          ? HttpStatus.NotFound
          : error.message === "No bookings to cancel"
          ? HttpStatus.BadRequest
          : HttpStatus.InternalServerError;

      sendError(
        res,
        status,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteSlot(req: Request, res: Response) {
    try {
      const { slotId } = req.params;
      await this.slotService.deleteSlot(slotId);
      sendResponse(res, HttpStatus.OK, "Slot deleted successfully");
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }

  async getSlot(req: Request, res: Response) {
    try {
      const { slotId } = req.params;
      const slot = await this.slotService.getSlots(slotId);
      console.log(slot)

      if (!slot) {
        sendError(
          res,
          HttpStatus.NotFound,
          MessageConstants.NO_AVAILABLE_SLOTS
        );
        return;
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.SUCCESS, slot);
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async updateSlot(req: Request, res: Response) {
    try {
      const { slotId } = req.params;
      const updates = req.body;

      // Validate maxPatients if it's being updated
      if (updates.maxPatients !== undefined && updates.maxPatients < 1) {
        return sendError(
          res,
          HttpStatus.BadRequest,
          "Maximum patients must be at least 1"
        );
      }

      const slot = await this.slotService.updateSlot(slotId, updates);
      sendResponse(res, HttpStatus.OK, "Slot updated successfully", slot);
    } catch (error: any) {
      const status =
        error.message === "Slot not found"
          ? HttpStatus.NotFound
          : error.message ===
            "Cannot reduce maximum patients below current bookings"
          ? HttpStatus.BadRequest
          : HttpStatus.InternalServerError;

      sendError(
        res,
        status,
        error.message || MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async checkSlotAvailability(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { slotId } = req.params;

      const availability = await this.slotService.checkSlotAvailability(slotId);

      sendResponse(
        res,
        HttpStatus.OK,
        "Slot availability checked successfully",
        availability
      );
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to check slot availability",
          process.env.NODE_ENV === "development" ? error : undefined
        );
      }
    }
  }
}
