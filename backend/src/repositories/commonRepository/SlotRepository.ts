import { HttpStatus } from "../../constants/Httpstatus";
import { ISlotRepository } from "../../interfaces/Slot/SlotRepositoryInterface";
import SlotModel, { ISlot } from "../../models/commonModel/SlotModel";
import { AppError } from "../../utils/AppError";
import mongoose, { UpdateQuery } from "mongoose";

export default class SlotRepository implements ISlotRepository {
  async createSlot(slot: ISlot): Promise<ISlot> {
    return await SlotModel.create(slot);
  }

  async findSlotsByDoctorAndDate(
    doctorId: string | mongoose.Types.ObjectId,
    date: Date | string
  ): Promise<ISlot[]> {
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(queryDate);
    nextDate.setDate(queryDate.getDate() + 1);

    return await SlotModel.find({
      doctorId: doctorId,
      date: {
        $gte: queryDate,
        $lt: nextDate,
      },
    });
  }

  async createRecurringSlots(slot: ISlot): Promise<ISlot[]> {
    if (!slot.recurring?.frequency) {
      throw new Error("Recurring frequency is missing");
    }

    const slots: ISlot[] = [];
    let currentDate = new Date(slot.date); // Start from the provided date
    const endDate = slot.recurring?.endDate
      ? new Date(slot.recurring.endDate)
      : new Date(
          currentDate.getFullYear() + 1,
          currentDate.getMonth(),
          currentDate.getDate()
        );

    console.log("Starting recurring slots creation:", {
      Initial_currentDate: currentDate,
      endDate: endDate,
      Frequency: slot.recurring.frequency,
    });

    let iterationCount = 0;
    const MAX_ITERATIONS = 1000;

    while (currentDate <= endDate && iterationCount < MAX_ITERATIONS) {
      console.log(
        `Iteration ${iterationCount + 1}: currentDate = ${currentDate}`
      );

      // Check for overlapping slots for this date
      const existingSlots = await this.findSlotsByDoctorAndDate(
        slot.doctorId,
        currentDate
      );

      const hasOverlap = existingSlots.some((existingSlot) => {
        const existingStart = existingSlot.startTime;
        const existingEnd = existingSlot.endTime;
        const newStart = slot.startTime;
        const newEnd = slot.endTime;

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });

      if (!hasOverlap) {
        // Preserve the start and end time while updating the date
        const newSlot: Partial<ISlot> = {
          doctorId: slot.doctorId,
          date: new Date(currentDate),
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxPatients: slot.maxPatients,
          bookedCount: slot.bookedCount || 0,
          isBooked: slot.isBooked || false,
          recurring: slot.recurring,
        };

        // Validation
        if (!newSlot.doctorId)
          throw new Error("doctorId is missing in newSlot");
        if (!newSlot.date) throw new Error("date is missing in newSlot");
        if (!newSlot.startTime || !newSlot.endTime)
          throw new Error("startTime or endTime is missing in newSlot");
        if (newSlot.maxPatients === undefined)
          throw new Error("maxPatients is missing in newSlot");
        if (newSlot.bookedCount === undefined)
          throw new Error("bookedCount is missing in newSlot");
        if (newSlot.isBooked === undefined)
          throw new Error("isBooked is missing in newSlot");

        console.log("Pushing slot:", newSlot);
        slots.push(await this.createSlot(newSlot as ISlot));
      } else {
        console.log(`Skipping overlapping slot for date ${currentDate}`);
      }

      // Move to the next date based on frequency
      if (slot.recurring?.frequency === "daily") {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (slot.recurring?.frequency === "weekly") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (slot.recurring?.frequency === "monthly") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      iterationCount++;
    }

    console.log("Loop ended. Total slots created:", slots.length);
    return slots;
  }

  async findSlotById(slotId: string): Promise<ISlot | null> {
    return await SlotModel.findById(slotId);
  }

  async findSlotsByDoctor(doctorId: string): Promise<ISlot[]> {
    return await SlotModel.find({ doctorId, isBooked: false });
  }

  async bookSlot(slotId: string): Promise<ISlot | null> {
    return await SlotModel.findByIdAndUpdate(
      slotId,
      { isBooked: true },
      { new: true }
    );
  }
  async updateSlot(
    slotId: string,
    updates: UpdateQuery<ISlot> // Change type to UpdateQuery<ISlot>
  ): Promise<ISlot | null> {
    return await SlotModel.findByIdAndUpdate(slotId, updates, { new: true });
  }

  // async updateSlot(
  //   slotId: string,
  //   updates: Partial<ISlot>
  // ): Promise<ISlot | null> {
  //   return await SlotModel.findByIdAndUpdate(slotId, updates, { new: true });
  // }

  async deleteSlot(slotId: string): Promise<ISlot | null> {
    return await SlotModel.findByIdAndDelete(slotId);
  }

  async blockSlots(
    doctorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ISlot[]> {
    await SlotModel.updateMany(
      {
        doctorId,
        startTime: { $gte: startTime },
        endTime: { $lte: endTime },
        isBooked: false,
      },
      { isBlocked: true }
    );
    return await SlotModel.find({
      doctorId,
      startTime: { $gte: startTime },
      endTime: { $lte: endTime },
      isBlocked: true,
    });
  }

  async findAvailableSlots(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ISlot[]> {
    return await SlotModel.find({
      doctorId,
      startTime: { $gte: startDate },
      endTime: { $lte: endDate },
      isBooked: false,
      isBlocked: false,
    });
  }

  async rescheduleAppointment(
    slotId: string,
    newSlotId: string
  ): Promise<ISlot | null> {
    const session = await SlotModel.startSession();
    try {
      session.startTransaction();

      await SlotModel.findByIdAndUpdate(slotId, { isBooked: false });
      const newBooking = await SlotModel.findByIdAndUpdate(
        newSlotId,
        { isBooked: true },
        { new: true }
      );

      await session.commitTransaction();
      return newBooking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  public async checkSlotAvailability(
    slotId: string
  ): Promise<{ available: boolean; maxPatients: number; bookedCount: number }> {
    const slot = await SlotModel.findById(slotId)
      .select("maxPatients bookedCount")
      .lean();

    if (!slot) {
      throw new AppError(HttpStatus.NOT_FOUND, "Slot not found");
    }

    return {
      available: slot.bookedCount < slot.maxPatients,
      maxPatients: slot.maxPatients,
      bookedCount: slot.bookedCount,
    };
  }

  async getAvailableSlots(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = "",
    date?: string
  ): Promise<{ slots: ISlot[]; total: number }> {
    const query: any = { doctorId, isBooked: false, isBlocked: false };

    // Get current date and time
  const now = new Date();
  const currentDate = new Date(now.toISOString().split('T')[0]);
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    if (date) {
      // Create date range for the entire day in UTC
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }else {
    // For all dates, only show future slots
    query.$or = [
      {
        date: { $gt: currentDate }
      },
      {
        date: currentDate,
        startTime: { $gte: currentTime }
      }
    ];
  }
    console.log("query.date :", query.date);
    const [slots, total] = await Promise.all([
      SlotModel.find(query)
        .sort({ date: 1, startTime: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      SlotModel.countDocuments(query),
    ]);

    return { slots, total };
  }

  async findSlots(query: any): Promise<ISlot[]> {
    return await SlotModel.find(query);
  }

  async countSlots(query: any): Promise<number> {
    return await SlotModel.countDocuments(query);
  }

  async decrementBookedCount(
    slotId: string,
  ): Promise<ISlot | null> {
    try {
      const result = await SlotModel.findByIdAndUpdate(
        slotId,
        { $inc: { bookedCount: -1 } },
        { new: true}
      );
      return result;
    } catch (error) {
      console.error("Error inside decrementBookedCount:", error);
      throw error;
    }
  }
}
