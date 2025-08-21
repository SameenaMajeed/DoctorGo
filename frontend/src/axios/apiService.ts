import axios from "axios";
import { store } from "../slice/Store/Store";
import { toast } from "react-hot-toast";
import { logoutUser } from "../slice/user/userSlice";
import { logoutDoctor } from "../slice/Doctor/doctorSlice";
import { adminLogout } from "../slice/admin/adminSlice";

// Define token response type
interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Role type
type Role = "user" | "doctor" | "admin" | "slot";

// Get base URL based on role
const getBaseUrl = (role: Role): string => {
  switch (role) {
    case "user":
      return import.meta.env.VITE_Base_Url_User;
    case "doctor":
      return import.meta.env.VITE_Base_Url_Doctor;
    case "admin":
      return import.meta.env.VITE_Base_Url_Admin;
    case "slot":
      return import.meta.env.VITE_Base_Url_Slot;
    default:
      throw new Error("Invalid role type");
  }
};

// Logout logic based on role
const logout = (role: Role): void => {
  const dispatch = store.dispatch;
  console.log(`Logging out ${role}...`);

  switch (role) {
    case "user":
      dispatch(logoutUser());
      window.location.href = "/login";
      break;
    case "doctor":
      dispatch(logoutDoctor());
      window.location.href = "/doctor/login";
      break;
    case "admin":
      dispatch(adminLogout());
      window.location.href = "/admin/login";
      break;
    case "slot":
      dispatch(logoutDoctor());
      window.location.href = "/doctor/login";
      break;
  }

  toast.error("Your session has expired. Please log in again.", {
    duration: 5000,
  });
};

// Factory function to create Axios instance
export const createApiInstance = (role: Role) => {
  const baseURL = getBaseUrl(role);

  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (originalRequest.url === "/login") return Promise.reject(error);

      const status = error.response?.status;

      if (status === 403) {
        toast.error("You have been blocked by the admin.");
        setTimeout(() => logout(role), 5000);
        return Promise.reject(error);
      }

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (
          error.response?.data?.message ===
          "Login failed. Please check your credentials."
        ) {
          toast.error("Login failed. Please check your credentials.");
          return Promise.reject(error);
        }

        const refreshTokenUrl = `${baseURL}/refresh-token`;

        try {
          const refreshResponse = await axios.post<TokenResponse>(
            refreshTokenUrl,
            {},
            { withCredentials: true }
          );

          const { accessToken } = refreshResponse.data.tokens;

          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          toast.error("Session expired. Please log in again.");
          setTimeout(() => logout(role), 5000);
          return Promise.reject(refreshError);
        }
      }

      toast.error("An unexpected error occurred. Please try again.");
      return Promise.reject(error);
    }
  );

  return instance;
};
