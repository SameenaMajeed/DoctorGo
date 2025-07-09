import toast from "react-hot-toast";
import slotApi from "../axios/SlotInstance";
import { ISlot, ISlotData } from "../types/Slot";

// Slot API methods
export const createSlot = async (slotData: ISlotData): Promise<ISlot | ISlot[]> => {
  try {
    const response = await slotApi.post<ISlot | ISlot[]>('/create', slotData); // Adjust endpoint
    toast.success('Slot created successfully!');
    return response.data;
  } catch (error: any) {
    console.error('Error creating slot:', error);
    throw error; // Let the caller handle the error
  }
};

export const getAvailableSlots = async (doctorId: string): Promise<ISlot[]> => {
  try {
    const response = await slotApi.get<ISlot[]>(`/${doctorId}`); // Adjust endpoint
    return response.data;
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

export const bookSlot = async (slotId: string): Promise<ISlot> => {
  try {
    const response = await slotApi.put<ISlot>(`/${slotId}/book`); // Adjust endpoint
    toast.success('Slot booked successfully!');
    return response.data;
  } catch (error: any) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

export default slotApi;