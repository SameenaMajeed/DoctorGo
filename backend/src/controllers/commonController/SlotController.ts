import { Request, Response } from "express";
import { ISlotService } from "../../interfaces/Slot/SlotServiceInterface";
import { sendError, sendResponse } from "../../utils/responseUtils";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { AppError } from "../../utils/AppError";

export default class SlotController {
  constructor(private _slotService: ISlotService) {}

  async createSlot(req: Request, res: Response) {
    try {
      const slotData = req.body;
      console.log("Controller received:", JSON.stringify(slotData, null, 2));

      // Validate maxPatients
      if (!slotData.maxPatients || slotData.maxPatients < 1) {
        return sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.MAXIMUM_PATIENTS_REQUIRED
        );
      }

      // Restrict doctorId to authenticated doctor's ID if role is 'doctor'
      if (req.data?.role === "doctor" && slotData.doctorId !== req.data.id) {
        return sendError(
          res,
          HttpStatus.Forbidden,
          MessageConstants.DOCTORS_CAN_ONLY_CREATE_SLOTS_FOR_THEMSELVES
        );
      }

      const slot = await this._slotService.createSlot(slotData);
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

      console.log("Request params:", {
        doctorId,
        date,
        page,
        limit,
        searchTerm,
      });

      if (!doctorId) {
        return sendError(res, HttpStatus.BadRequest,MessageConstants.DOCTOR_ID_REQUIRED);
      }

      const { slots, total } = await this._slotService.getAvailableSlots(
        doctorId,
        date as string | undefined,
        page,
        limit,
        searchTerm
      );

      console.log("Slots :", slots);
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
        sendError(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          MessageConstants.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  
  async bookSlot(req: Request, res: Response) {
    try {
      const slotId = req.params.slotId;
      if (!slotId) {
        return sendError(res, HttpStatus.BadRequest, MessageConstants.SLOT_ID_REQUIRED);
      }

      const slot = await this._slotService.bookSlot(slotId);
      sendResponse(res, HttpStatus.OK, MessageConstants.SLOT_BOOKED, slot);
    } catch (error: any) {
      const status =
        error.message === MessageConstants.SLOT_NOT_FOUND
          ? HttpStatus.NotFound
          : error.message === MessageConstants.SLOT_FULLY_BOOKED ||
            error.message === MessageConstants.SLOT_BOOKED
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
        return sendError(res, HttpStatus.BadRequest, MessageConstants.SLOT_ID_REQUIRED);
      }

      const slot = await this._slotService.cancelBooking(slotId);
      sendResponse(res, HttpStatus.OK, MessageConstants.BOOKING_CANCELLED, slot);
    } catch (error: any) {
      const status =
        error.message === MessageConstants.SLOT_NOT_FOUND
          ? HttpStatus.NotFound
          : error.message === MessageConstants.NO_BOOKINGS_TO_CANCEL
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
      await this._slotService.deleteSlot(slotId);
      sendResponse(res, HttpStatus.OK,MessageConstants.SLOT_DELETED);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }

  async getSlot(req: Request, res: Response) {
    try {
      const { slotId } = req.params;
      const slot = await this._slotService.getSlots(slotId);
      console.log(slot);

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
          MessageConstants.MAXIMUM_PATIENTS_REQUIRED
        );
      }

      const slot = await this._slotService.updateSlot(slotId, updates);
      sendResponse(res, HttpStatus.OK, MessageConstants.SLOT_UPDATED, slot);
    } catch (error: any) {
      const status =
        error.message === MessageConstants.SLOT_NOT_FOUND
          ? HttpStatus.NotFound
          : error.message ===
            MessageConstants.CANNOT_REDUCE_MAXIMUM_PATIENTS_BELOW_CURRENT_BOOKINGS
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
      if (!slotId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.SLOT_ID_REQUIRED
        );
      }

      const availability = await this._slotService.checkSlotAvailability(slotId);
      console.log('availability :' , availability )

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.SLOT_AVAILABILITY_CHECKED,
        availability
      );
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          MessageConstants.FAILED_TO_CHECK_SLOT_AVAILABILITY,
          process.env.NODE_ENV === "development" ? error : undefined
        );
      }
    }
  }
}
