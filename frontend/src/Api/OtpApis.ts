import { createApiInstance } from "../axios/apiService";
// import api from "../axios/UserInstance";
import {
  setOtpExpired,
  setOtpSent,
  setOtpVerified,
} from "../slice/Otp/otpSlice";
import { setLoading, setError } from "../slice/user/userSlice";
import { Dispatch } from "redux";

const api = createApiInstance("user");

// send
export const sendOtp = async (
  email: string,
  dispatch: Dispatch
): Promise<{ success: boolean; message: string }> => {
  try {
    dispatch(setLoading());
    const response = await api.post("/otp/send", { email });
    dispatch(setOtpSent(email));
    return {
      success: true,
      message: response.data.message || "OTP sent successfully.",
    };
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    const errorMessage =
      error.response?.data?.message || "Failed to send OTP. Please try again.";
    dispatch(setError(errorMessage));
    return { success: false, message: errorMessage };
  }
};

// verify
export const verifyOtp = async (
  email: string,
  otp: string,
  dispatch: any
): Promise<{
  success: boolean;
  message: string;
  expired?: boolean;
}> => {
  try {
    dispatch(setLoading());
    await api.post("/otp/verify", { email, otp });
    dispatch(setOtpVerified());
    return {
      success: true,
      message: "OTP verified successfully!",
    };
  } catch (error: any) {
    console.error(error);

    if (error.response?.data?.message === "OTP expired") {
      dispatch(setOtpExpired());
      return {
        success: false,
        message: "Your OTP has expired. Please resend the OTP.",
        expired: true,
      };
    }

    dispatch(setError("Error verifying OTP."));
    return {
      success: false,
      message: "Error verifying OTP. Please try again.",
    };
  }
};

// resend otp
export const resendOtp = async (
  email: string,
  dispatch: any
): Promise<{ success: boolean; message: string }> => {
  try {
    dispatch(setLoading());

    const response = await api.post("/otp/send", { email });

    if (response.data.success) {
      dispatch(setOtpSent(email));
      return {
        success: true,
        message: "A new OTP has been sent to your email.",
      };
    }

    throw new Error(response.data.message || "Failed to send OTP");
  } catch (error: any) {
    console.error("OTP Resend Error:", error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Error resending OTP. Please try again.";

    dispatch(setError("Error resending OTP."));
    return {
      success: false,
      message: errorMessage,
    };
  }
};
