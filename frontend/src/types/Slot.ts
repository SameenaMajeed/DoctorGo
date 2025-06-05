export interface ISlot {
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
export interface ISlotData {
  doctorId: string;
  startTime: string;
  endTime: string;
  recurring?: {
    isRecurring: boolean;
    frequency?: "daily" | "weekly" | "monthly";
    endDate?: string;
  };
}

// export interface ISubSlot {
//   startTime: string;
//   endTime: string;
//   isBooked: boolean;
//   patientId?: string;
// }

// export interface ISlot {
//   _id: string;
//   doctorId: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   isBooked?: boolean;
//   isBlocked: boolean;
//   maxPatients: number;
//   bookedCount: number;
//   subSlots: ISubSlot[];
//   recurring?: {
//     isRecurring: boolean;
//     frequency?: "daily" | "weekly" | "monthly";
//     endDate?: string;
//   };
// }
