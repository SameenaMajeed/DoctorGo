import adminApi from "../axios/AdminInstance";
import { IDoctor } from "../Types";
import { IAxiosError } from "../types/auth";

// login
type AdminLoginCredentials = {
  email: string;
  password: string;
};

type AdminLoginResponse = {
  success: boolean;
  message: string;
  admin?: {
    _id: string;
    email: string;
    // Add other admin fields as needed
  };
  accessToken?: string;
  error?: string;
};


export const adminLoginService = async (
  credentials: AdminLoginCredentials
): Promise<AdminLoginResponse> => {
  try {
    const response = await adminApi.post("/login", credentials);

    if (!response.data?.data) {
      throw new Error("Invalid response structure");
    }

    const { admin, accessToken } = response.data.data;

    return {
      success: true,
      message: "Login successful",
      admin: {
        _id: admin._id,
        email: admin.email,
        // Add other admin fields as needed
      },
      accessToken
    };
  } catch (error) {
    const axiosError = error as IAxiosError;
    let errorMessage = "Invalid email or password. Please try again.";

    if (axiosError.response) {
      // Handle specific HTTP status codes
      switch (axiosError.response.status) {
        case 401:
          errorMessage = "Invalid credentials";
          break;
        case 403:
          errorMessage = "Account not authorized for admin access";
          break;
        case 404:
          errorMessage = "Admin account not found";
          break;
        default:
          errorMessage = axiosError.response.data?.message || errorMessage;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Admin login error:", error);
    return {
      success: false,
      message: errorMessage,
      error: errorMessage
    };
  }
};

// type PendingDoctorsResponse = {
//   data: {
//     doctors: any[]; // Replace with your Doctor type
//     total: number;
//   };
//   message?: string;
// };

// Approval
interface PendingDoctorsResponse {
  success: boolean;
  message: string;
  data: {
    doctors: IDoctor[];
    total: number;
    page: number;
    limit: number;
  };
}

type FetchPendingDoctorsResult = {
  success: boolean;
  message: string;
  doctors?: any[]; // Replace with your Doctor type
  total?: number;
};

export const fetchPendingDoctors = async (
  page: number,
  limit: number,
  searchTerm?: string
): Promise<FetchPendingDoctorsResult> => {
  try {
    const response = await adminApi.get<PendingDoctorsResponse>('/doctors/pending', {
      params: { page, limit, searchTerm }
    });

    if (!response.data?.data) {
      throw new Error('Invalid response structure');
    }

    return {
      success: true,
      message: response.data.message || 'Pending doctors fetched successfully',
      doctors: response.data.data.doctors || [],
      total: response.data.data.total || 0
    };
  } catch (error) {
    const axiosError = error as IAxiosError;
    let errorMessage = 'Failed to fetch pending doctors';

    if (axiosError.response) {
      errorMessage = axiosError.response.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Fetch pending doctors error:', error);
    return {
      success: false,
      message: errorMessage
    };
  }
};

export const fetchDoctor = async (
  page: number,
  limit: number,
  searchTerm: string,
  isBlocked: string
) => {
  try {
    const response = await adminApi.get<any>("/doctor", {
      params: { page, limit, searchTerm, isBlocked },
    });

    // Extract the nested `data` object from the response
    const { data } = response.data;

    console.log("Extracted data:", data); // Log the extracted data
    return data; // Return the nested `data` object
  } catch (error) {
    console.error("Error fetching Doctors:", error);
    throw new Error("Failed to fetch Doctors. Please try again later.");
  }
};

// Approval status
type UpdateDoctorStatusParams = {
  doctorId: string;
  isBlocked: boolean;
  blockReason?: string;
};

type UpdateDoctorStatusResponse = {
  success: boolean;
  message: string;
  shouldRemove?: boolean; // Flag to indicate if doctor should be removed from list
};

export const updateDoctorStatus = async (
  params: UpdateDoctorStatusParams
): Promise<UpdateDoctorStatusResponse> => {
  try {
    const { doctorId, isBlocked, blockReason } = params;

    const response = await adminApi.post('/doctors/update-status', {
      doctorId,
      isBlocked,
      blockReason: isBlocked ? blockReason : undefined,
    });

    console.log(response)

    return {
      success: true,
      message: `Doctor ${isBlocked ? 'blocked' : 'approved'} successfully!`,
      shouldRemove: true,
    };
  } catch (error) {
    const axiosError = error as IAxiosError;
    let errorMessage = 'Failed to update doctor status';

    if (axiosError.response) {
      errorMessage = axiosError.response.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Update doctor status error:', error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};


export const fetchUser = async (
  page: number,
  limit: number,
  searchTerm: string,
  isBlocked: string
) => {
  try {
    const response = await adminApi.get<any>("/users", {
      params: { page, limit, searchTerm, isBlocked },
    });

    // Extract the nested `data` object from the response
    const { data } = response.data;

    console.log("Extracted data:", data); // Log the extracted data
    return data; // Return the nested `data` object
  } catch (error) {
    console.error("Error fetching Users:", error);
    throw new Error("Failed to fetch Users. Please try again later.");
  }
};

export const blockDoctor = async (doctorId : string , isBlocked : boolean) => {
    try {
       await adminApi.post('/block-doctor', { doctorId, isBlocked });
        
    }catch (error: any) {
        console.error('Error blocking doctor:', error.response?.data || error.message);
      }
}
export const blockUser = async (userId : string , isBlocked : boolean) => {
    try {
       await adminApi.post('/block-user', { userId, isBlocked });
        
    }catch (error: any) {
        console.error('Error blocking user:', error.response?.data || error.message);
      }
}

export const approveDoctor = async (doctorId: string) => {
  const response = await adminApi.post(`/approve`, {
    doctorId,
    status: "approved",
  });
  console.log(response.data);
  return response.data;
};


// export const rejectDoctor = async (doctorId: string, notes: string) => {
//   const response = await adminApi.patch(`/reject-doctor/${doctorId}`, { notes });
//   return response.data;
// };


