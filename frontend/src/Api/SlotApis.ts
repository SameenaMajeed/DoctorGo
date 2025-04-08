import toast from "react-hot-toast";
import slotApi from "../axios/SlotInstance";
import { Slot, SlotData } from "../types/Slot";

// Slot API methods
export const createSlot = async (slotData: SlotData): Promise<Slot | Slot[]> => {
  try {
    const response = await slotApi.post<Slot | Slot[]>('/create', slotData); // Adjust endpoint
    toast.success('Slot created successfully!');
    return response.data;
  } catch (error: any) {
    console.error('Error creating slot:', error);
    throw error; // Let the caller handle the error
  }
};

export const getAvailableSlots = async (doctorId: string): Promise<Slot[]> => {
  try {
    const response = await slotApi.get<Slot[]>(`/${doctorId}`); // Adjust endpoint
    return response.data;
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

export const bookSlot = async (slotId: string): Promise<Slot> => {
  try {
    const response = await slotApi.put<Slot>(`/${slotId}/book`); // Adjust endpoint
    toast.success('Slot booked successfully!');
    return response.data;
  } catch (error: any) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

export default slotApi;