import { HttpStatus } from "../../constants/Httpstatus";
import { ISlotRepository } from "../../interfaces/Slot/SlotRepositoryInterface";
import Slot, { ISlot } from "../../models/commonModel/SlotModel";
import { AppError } from "../../utils/AppError";
import NodeCache from "node-cache";

// Initialize cache with a 5 minute TTL (time to live)
const slotCache = new NodeCache({ stdTTL: 300 });

export default class SlotService {
  constructor(private slotrepo: ISlotRepository) {}

  async createSlot(slot: ISlot): Promise<ISlot | ISlot[]> {
    console.log("Service received:", JSON.stringify(slot, null, 2));

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(slot.startTime)) {
      throw new Error("Invalid start time format. Expected HH:mm");
    }
    if (!timeRegex.test(slot.endTime)) {
      throw new Error("Invalid end time format. Expected HH:mm");
    }

    // Compare times
    const [startHours, startMinutes] = slot.startTime.split(":").map(Number);
    const [endHours, endMinutes] = slot.endTime.split(":").map(Number);

    if (
      startHours > endHours ||
      (startHours === endHours && startMinutes >= endMinutes)
    ) {
      throw new Error("Start time must be before end time");
    }

    if (!slot.maxPatients || slot.maxPatients < 1) {
      throw new Error("Maximum patients must be at least 1");
    }

    if (slot.recurring?.isRecurring) {
      if (!slot.recurring.frequency) {
        throw new Error("Frequency is required for recurring slots");
      }
      if (
        slot.recurring.endDate &&
        new Date(slot.recurring.endDate) <= new Date(slot.date)
      ) {
        throw new Error("Recurring end date must be after the start date");
      }
    }

    // Check for overlapping slots
    const existingSlots = await this.slotrepo.findSlotsByDoctorAndDate(
      slot.doctorId,
      slot.date
    );

    const newStart = slot.startTime;
    const newEnd = slot.endTime;

    for (const existingSlot of existingSlots) {
      const existingStart = existingSlot.startTime;
      const existingEnd = existingSlot.endTime;

      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        throw new Error(
          `Slot overlaps with existing slot (${existingStart} - ${existingEnd})`
        );
      }
    }

    const slotData = new Slot({
      ...slot,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      bookedCount: slot.bookedCount || 0,
      isBooked: slot.isBooked || false,
    });

    console.log("Processed Slot Data:", slotData);

    if (slot.recurring?.isRecurring) {
      console.log("Recurring slot detected, calling createRecurringSlots");
      return await this.slotrepo.createRecurringSlots(slotData);
    }

    return await this.slotrepo.createSlot(slotData);
  }

  private formatTimeForDisplay(timeString: string): string {
    try {
      if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
        return timeString;
      }

      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    } catch {
      console.warn("Invalid time format:", timeString);
    }
    return "Invalid Time";
  }

  async getAvailableSlots(
    doctorId: string,
    date?: string | undefined,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ""
  ): Promise<{ slots: ISlot[]; total: number }> {
    const cacheKey = `slots:${doctorId}:${date || "all"}:${page}:${limit}:${searchTerm}`;
  
    // Try to get from cache first
    const cachedData = slotCache.get<{ slots: ISlot[]; total: number }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  
    if (!doctorId) {
      throw new AppError(HttpStatus.BadRequest, "Doctor ID is required");
    }
  
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError(HttpStatus.BadRequest, "Invalid date format. Expected YYYY-MM-DD");
    }
  
    const { slots, total } = await this.slotrepo.getAvailableSlots(
      doctorId,
      page,
      limit,
      searchTerm,
      date
    );
  
    const result = {
      slots: slots.map((slot) => {
        const slotObject = slot.toObject();
        return {
          ...slotObject,
          startTime: this.formatTimeForDisplay(slotObject.startTime),
          endTime: this.formatTimeForDisplay(slotObject.endTime),
        };
      }),
      total,
    };
  
    slotCache.set(cacheKey, result);
    return result;
  }
  

  //   async getAvailableSlots(
  //     doctorId: string,
  //     page: number,
  //     limit: number,
  //     searchTerm: string
  // ): Promise<{ slots: ISlot[]; total: number }> {
  //     if (!doctorId) {
  //       throw new Error("Doctor ID is required");
  //     }
  //     return await this.slotrepo.getAvailableSlots(doctorId, page, limit, searchTerm);
  //   }

  async bookSlot(slotId: string): Promise<ISlot> {
    if (!slotId) {
      throw new Error("Slot ID is required");
    }

    const slot = await this.slotrepo.findSlotById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.isBlocked) {
      throw new Error("Slot is blocked");
    }

    if (slot.bookedCount >= slot.maxPatients) {
      throw new Error("Slot is fully booked");
    }

    // Increment bookedCount
    slot.bookedCount += 1;

    // Update isBooked status if max patients reached
    if (slot.bookedCount >= slot.maxPatients) {
      slot.isBooked = true;
    }

    const updatedSlot = await this.slotrepo.updateSlot(slotId, slot);
    if (!updatedSlot) {
      throw new Error("Failed to update slot");
    }
    return updatedSlot;
  }

  async cancelBooking(slotId: string): Promise<ISlot> {
    if (!slotId) {
      throw new Error("Slot ID is required");
    }

    const slot = await this.slotrepo.findSlotById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.bookedCount <= 0) {
      throw new Error("No bookings to cancel");
    }

    // Decrement bookedCount
    slot.bookedCount -= 1;

    // Update isBooked status
    slot.isBooked = slot.bookedCount >= slot.maxPatients;

    const updatedSlot = await this.slotrepo.updateSlot(slotId, slot);
    if (!updatedSlot) {
      throw new Error("Failed to update slot");
    }
    return updatedSlot;
  }

  async deleteSlot(slotId: string): Promise<void> {
    const result = await this.slotrepo.deleteSlot(slotId);
    if (!result) {
      throw new Error("Failed to delete slot or slot not found");
    }
  }

  async getSlots(slotId: string): Promise<ISlot | null> {
    return await this.slotrepo.findSlotById(slotId);
  }

  async updateSlot(slotId: string, updates: Partial<ISlot>): Promise<ISlot> {
    const slot = await this.slotrepo.findSlotById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    // Validate maxPatients update
    if (updates.maxPatients !== undefined) {
      if (updates.maxPatients < 1) {
        throw new Error("Maximum patients must be at least 1");
      }
      if (slot.bookedCount > updates.maxPatients) {
        throw new Error(
          "Cannot reduce maximum patients below current bookings"
        );
      }
    }

    const updatedSlot = await this.slotrepo.updateSlot(slotId, updates);
    if (!updatedSlot) {
      throw new Error("Failed to update slot");
    }
    return updatedSlot;
  }

  // services/SlotService.ts
  public async checkSlotAvailability(
    slotId: string
  ): Promise<{ available: boolean; details: string }> {
    try {
      const availability = await this.slotrepo.checkSlotAvailability(slotId);

      return {
        available: availability.available,
        details: availability.available
          ? `Slot available (${availability.bookedCount}/${availability.maxPatients} booked)`
          : `Slot fully booked (${availability.maxPatients}/${availability.maxPatients})`,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Failed to check slot availability"
      );
    }
  }
}
