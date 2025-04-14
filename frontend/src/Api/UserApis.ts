import axiosUser from '../axios/UserInstance'

export const bookAppointment = async (appointmentData : any) => {
    try {
      const response = await axiosUser.post("/api/appointments", appointmentData);
      return response.data;
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw error;
    }
  };
