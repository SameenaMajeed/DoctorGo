import { createApiInstance } from "../axios/apiService";
// import doctorApi from "../axios/DoctorInstance";
import { IAppointment, IDoctor } from "../Types";
import { IAxiosError } from "../types/auth";

type IFetchAppointmentsParams = {
    doctorId: string;
    page: number;
    limit: number;
    statusFilter?: string;
};
  
type IFetchAppointmentsResponse = {
    success: boolean;
    message: string;
    appointments?: IAppointment[];
    totalPages?: number;
};

const doctorApi = createApiInstance("doctor");

// Appointments listing  
export const fetchDoctorAppointments = async (
    params: IFetchAppointmentsParams
  ): Promise<IFetchAppointmentsResponse> => {
    const { doctorId, page, limit, statusFilter } = params;
  
    if (!doctorId) {
      return {
        success: false,
        message: "Doctor ID is required",
      };
    }
  
    try {
      const response = await doctorApi.get(`/${doctorId}/appointments`, {
        params: { page, limit, status: statusFilter },
      });
  
      if (!response.data?.data) {
        throw new Error("Invalid response structure");
      }

      console.log('response.data.data.bookings :' , response.data.data.bookings )
  
      return {
        success: true,
        message: "Appointments fetched successfully",
        appointments: response.data.data.bookings || [],
        totalPages: response.data.data.totalPages || 1,
      };
    } catch (error) {
      const axiosError = error as IAxiosError;
      let errorMessage = "Failed to fetch appointments";
  
      if (axiosError.response) {
        errorMessage = axiosError.response.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      console.error("Fetch appointments error:", error);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };


//   updating appointment status

type UpdateAppointmentStatusParams = {
    appointmentId: string;
    status: string;
  };
  
  type UpdateAppointmentStatusResponse = {
    success: boolean;
    message: string;
    shouldRefresh?: boolean; // Flag to indicate if appointments should be refetched
  };

export const updateAppointmentStatus = async (
    params: UpdateAppointmentStatusParams
  ): Promise<UpdateAppointmentStatusResponse> => {
    const { appointmentId, status } = params;
  
    try {
      if (!appointmentId) {
        throw new Error("Appointment ID is required");
      }
  
      if (!status) {
        throw new Error("Status is required");
      }
  
      const response = await doctorApi.put(`/appointments/${appointmentId}/status`, { status });
      console.log(response)
  
      return {
        success: true,
        message: `Appointment marked as ${status}`,
        shouldRefresh: true, // Indicates appointments should be refetched
      };
    } catch (error) {
      const axiosError = error as IAxiosError;
      let errorMessage = "Failed to update appointment status";
  
      if (axiosError.response) {
        // Handle specific HTTP status codes
        switch (axiosError.response.status) {
          case 400:
            errorMessage = "Invalid status update request";
            break;
          case 404:
            errorMessage = "Appointment not found";
            break;
          case 409:
            errorMessage = "Status cannot be updated at this time";
            break;
          default:
            errorMessage = axiosError.response.data?.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      console.error("Update appointment status error:", error);
      return {
        success: false,
        message: errorMessage,
      };
    }
  };


//   signup
type DoctorSignupFormData = {
    [key: string]: string | File;
    certificationFile: File;
    // Add other expected fields here
    // confirmPassword?: string;
  };
  
  type DoctorSignupResponse = {
    success: boolean;
    message: string;
    doctor?: {
      id: string;
      isApproved: boolean;
      approvalStatus: string;
      doctor: IDoctor; 
      accessToken: string; 
      refreshToken: string; 
      role: string;
    };
    redirectTo?: string;
  };

export const completeDoctorSignup = async (
    formData: DoctorSignupFormData
  ): Promise<DoctorSignupResponse> => {
    try {
      if (!formData || !formData.certificationFile) {
        throw new Error("Certification file is required");
      }
  
      const formDataToSend = new FormData();
      
      // Append all form data except confirmPassword
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "confirmPassword") {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (value !== undefined) {
            formDataToSend.append(key, value.toString());
          }
        }
      });
  
      // Set approval status
      formDataToSend.append("isApproved", "false");
      formDataToSend.append("approvalStatus", "pending");
  
      const response = await doctorApi.post("/signup", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (!response.data?.doctor) {
        throw new Error("Invalid response structure");
      }
  
      return {
        success: true,
        message: "Doctor signup successful",
        doctor: {
          ...response.data.doctor,
          isApproved: false,
          approvalStatus: "pending",
        },
        redirectTo: "/doctor/login"
      };
    } catch (error) {
      const axiosError = error as IAxiosError;
      let errorMessage = "Signup failed";
  
      if (axiosError.response) {
        // Handle specific HTTP status codes
        switch (axiosError.response.status) {
          case 400:
            errorMessage = "Invalid form data";
            break;
          case 409:
            errorMessage = "Doctor already exists";
            break;
          case 413:
            errorMessage = "File size too large";
            break;
          default:
            errorMessage = axiosError.response.data?.error || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      console.error("Doctor signup error:", error);
      return {
        success: false,
        message: errorMessage
      };
    }
};



export const getTodaysAppointments = async (): Promise<IAppointment[]> => {
  const response = await doctorApi.get('/appointments/today');
  const appointment = response.data.data.appointments
  return appointment;
  // return response.data;
};


export const fetchDoctorRevenue = async (): Promise<number> => {
  const response = await doctorApi.get("/revenue");
  console.log('Revenue:',response.data.data.revenue)
  return response.data.data.revenue;
};