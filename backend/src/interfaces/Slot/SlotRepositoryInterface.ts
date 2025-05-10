import mongoose from "mongoose";
import { ISlot } from "../../models/commonModel/SlotModel";

export interface ISlotRepository {
  createSlot(slot: ISlot): Promise<ISlot>;
  createRecurringSlots(slot: ISlot): Promise<ISlot[]>;
  findSlotsByDoctorAndDate(
    doctorId: string | mongoose.Types.ObjectId,
    date: Date | string
  ): Promise<ISlot[]>;
  findSlotsByDoctor(doctorId: string): Promise<ISlot[]>;
  findSlotById(slotId: string): Promise<ISlot | null>;
  updateSlot(slotId: string, updates: Partial<ISlot>): Promise<ISlot | null>;
  deleteSlot(slotId: string): Promise<ISlot | null>;
  blockSlots(
    doctorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ISlot[]>;
  findAvailableSlots(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ISlot[]>;
  rescheduleAppointment(
    slotId: string,
    newSlotId: string
  ): Promise<ISlot | null>;
  getAvailableSlots(
    doctorId: string,
    page: number,
    limit: number,
    searchTerm: string,
    date: string | undefined
  ): Promise<{ slots: ISlot[]; total: number }>;

  checkSlotAvailability(
    slotId: string
  ): Promise<{ available: boolean; maxPatients: number; bookedCount: number }>;

  findSlots(query: any): Promise<ISlot[]>;
  countSlots(query: any): Promise<number>;
}
