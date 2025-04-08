export interface Slot {
  id: any;
  _id: string;
  doctorId: string;
  date : string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isBlocked: boolean;
  maxPatients: number;
  bookedCount: number;
  recurring?: {
    isRecurring: boolean;
    frequency?: "daily" | "weekly" | "monthly";
    endDate?: string;
  };
  fee : number
}
// Interface for slot data (adjust based on your ISlot type)
export interface SlotData {
  doctorId: string;
  startTime: string;
  endTime: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: "daily" | "weekly" | "monthly";
    endDate?: string;
  };
}
