import { ISlot } from "../../models/SlotModel";

export interface ISlotService {
    createSlot(slot: ISlot): Promise<ISlot | ISlot[]>;
    getAvailableSlots(
        doctorId: string,
        date :  string |undefined,
        page: number,
        limit: number,
        searchTerm: string
    ): Promise<{ slots: ISlot[]; total: number }>;
    // getAvailableSlots(doctorId: string): Promise<ISlot[]>;
    bookSlot(slotId: string): Promise<ISlot>;
    cancelBooking(slotId: string): Promise<ISlot>;
    deleteSlot(slotId: string): Promise<void>;
    getSlots(slotId: string): Promise<ISlot | null> 
    updateSlot(slotId: string, updates: Partial<ISlot>): Promise<ISlot>;

    checkSlotAvailability(slotId: string): Promise<{ available: boolean; details: string }>
}