import api from "../axios/UserInstance";
import { setLoading, setError, setUser } from "../slice/user/userSlice";
import {
  IAxiosError,
  ILoginResponse,
  IProfilePictureResponse,
  IProfileResponse,
  IReviewCheckResponse,
  IReviewResponse,
  IUpdateProfileResponse,
} from "../types/auth";

// Signup
export const registerUser = async (
  userData: {
    name: string;
    email: string;
    password: string;
    mobile_no: string;
    gender: string;
  },
  dispatch: any
) => {
  try {
    dispatch(setLoading());
    const response = await api.post("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    dispatch(setError("Error registering user."));
    throw error;
  }
};

// Login
export const loginUser = async (
  email: string,
  password: string,
  dispatch: any
): Promise<{ success: boolean; message?: string }> => {
  try {
    dispatch(setLoading());

    const response = await api.post<ILoginResponse>(
      "/login",
      { email, password },
      { withCredentials: true }
    );

    const { user, accessToken, refreshToken } = response.data.data;

    console.log("Login response:", response.data);
    dispatch(
      setUser({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        mobile_no: user.mobile_no || "",
        isBlocked : user.isBlocked,
        accessToken,
        refreshToken,
        // isBlocked: user.isBlocked || false
      })
    );

    return { success: true };
  } catch (error: any) {
    console.error(error);
    const errorMessage =
      error.response?.data?.message ||
      "An unexpected error occurred. Please try again.";

    dispatch(setError("Login failed."));
    return { success: false, message: errorMessage };
  }
};

// Profile
export const fetchUserProfile = async (
  dispatch: any,
  reset?: (data: any) => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    dispatch(setLoading());

    const response = await api.get<IProfileResponse>("/profile");
    const profileData = response.data.data;

    // Format data for form
    const formattedData = {
      ...profileData,
      DOB: formatDateForInput(profileData.DOB),
      profilePicture: profileData.profilePicture ?? undefined,
    };

    dispatch(setUser(formattedData));

    if (reset) {
      reset(formattedData);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Profile fetch error:", error);

    const errorMessage =
      error.response?.data?.message || "Failed to fetch user profile.";

    dispatch(setError(errorMessage));
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Format date for input[type="date"]
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// profile Update
interface FormData {
  name: string;
  email: string;
  mobile_no: string;
  address?: string;
  DOB: string;
  gender: string;
  age?: string;
}


export const updateUserProfile = async (
  data: FormData,
  dispatch: any
): Promise<{
  success: boolean;
  message: string;
  updatedUser?: IUpdateProfileResponse["data"];
}> => {
  try {
    dispatch(setLoading());

    // Validate required fields
    if (
      !data.name ||
      !data.email ||
      !data.mobile_no ||
      !data.address ||
      !data.gender ||
      !data.DOB ||
      !data.age
    ) {
      throw new Error("Required fields are missing");
    }

    // Prepare update payload (exclude undefined values)
    const updateData = {
      name: data.name,
      email: data.email,
      mobile_no: data.mobile_no,
      address: data.address,
      gender: data.gender,
      DOB: data.DOB,
      age: data.age,
    };

    const response = await api.put<IUpdateProfileResponse>(
      "/updateProfile",
      updateData
    );

    if (!response.data?.data) {
      throw new Error("Invalid response structure from server");
    }

    console.log(response.data.data)

    dispatch(setUser(response.data.data));

    return {
      success: true,
      message: "Profile updated successfully",
      updatedUser: response.data.data,
    };
  } catch (error) {
    const axiosError = error as IAxiosError;
    let errorMessage = "Failed to update profile";

    if (axiosError.response) {
      // Handle specific HTTP status codes
      switch (axiosError.response.status) {
        case 400:
          errorMessage =
            axiosError.response.data?.message || "Invalid data provided";
          break;
        case 401:
          errorMessage = "Session expired. Please login again";
          break;
        case 409:
          errorMessage = "Email already in use";
          break;
        default:
          errorMessage = axiosError.response.data?.message || errorMessage;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Profile update error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

//Profile picture update
export const updateProfilePicture = async (
  file: File | null,
  dispatch: any
): Promise<IProfilePictureResponse> => {
  try {
    dispatch(setLoading());

    // Validate file exists
    if (!file) {
      throw new Error("No file selected");
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, or GIF are allowed");
    }

    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum 5MB allowed");
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await api.put<{
      data: {
        profilePicture: string;
      };
      message: string;
    }>("/uploadProfilePicture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data?.data) {
      throw new Error("Invalid response structure from server");
    }

    // Dispatch action to update user in store if needed
    // dispatch(setUser(response.data.data));

    return {
      success: true,
      message: response.data.message || "Profile picture updated successfully",
      data: response.data.data,
    };
  } catch (error) {
    const axiosError = error as IAxiosError;
    let errorMessage = "Failed to update profile picture";

    if (axiosError.response) {
      // Handle specific HTTP status codes
      switch (axiosError.response.status) {
        case 400:
          errorMessage =
            axiosError.response.data?.message || "Invalid file provided";
          break;
        case 401:
          errorMessage = "Session expired. Please login again";
          break;
        case 413:
          errorMessage = "File size too large";
          break;
        default:
          errorMessage = axiosError.response.data?.message || errorMessage;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Profile picture update error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

//Submit new review
export const submitReview = async (
  reviewData: {
    doctor_id: string;
    appointment_id: string;
    reviewText: string;
    rating: number;
  },
  dispatch: any
): Promise<IReviewResponse> => {
  try {
    dispatch(setLoading());
    const response = await api.post<IReviewResponse>("/submitReview", reviewData);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to submit review";
    dispatch(setError(errorMessage));
    throw error;
  }
};

// Update existing review
export const updateReview = async (
  reviewId: string,
  reviewData: {
    rating?: number;
    reviewText?: string;
  },
  dispatch: any
): Promise<IReviewResponse> => {
  try {
    dispatch(setLoading());
    const response = await api.put<IReviewResponse>(
      `/updateReview/${reviewId}`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update review";
    dispatch(setError(errorMessage));
    throw error;
  }
};

// Check if review exists for appointment
export const checkReview = async (
  appointmentId: string,
  dispatch: any
): Promise<IReviewCheckResponse> => {
  try {
    dispatch(setLoading());
    const response = await api.get<IReviewCheckResponse>(
      `/reviews/check?appointmentId=${appointmentId}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to check review status";
    dispatch(setError(errorMessage));
    throw error;
  }
};

// Get reviews by doctor
export const getDoctorReviews = async (
  doctorId: string,
  dispatch: any
): Promise<{ data: IReviewResponse['data'][]; message: string }> => {
  try {
    dispatch(setLoading());
    const response = await api.get(`/reviews/doctor/${doctorId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch doctor reviews";
    dispatch(setError(errorMessage));
    throw error;
  }
};



// export const bookAppointment = async (appointmentData : any) => {
//     try {
//       const response = await axiosUser.post("/api/appointments", appointmentData);
//       return response.data;
//     } catch (error) {
//       console.error("Error booking appointment:", error);
//       throw error;
//     }
//   };
