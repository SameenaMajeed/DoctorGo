import axios from "axios";
import toast from "react-hot-toast";
import { store } from "../slice/Store/Store";
import { logoutDoctor } from "../slice/Doctor/doctorSlice";

interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Set up Axios instance for doctor
const doctorApi = axios.create({
  baseURL: "http://localhost:5000/api/doctor",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// logout function
const logout = (): void => {
  console.log("Logging out the doctor...");
  const dispatch = store.dispatch;
  dispatch(logoutDoctor());

  toast.error("Your session has expired. Please log in again.", {
    duration: 5000, // Display toast for 5 seconds
  });

  setTimeout(() => {
    window.location.href = "/doctor/login";
  }, 1000);
};

// Add a response interceptor to handle token expiration and auto-refresh
doctorApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // skip interceptor logic for login response
    if (originalRequest.url === "/login") {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status } = error.response;

      if (status === 403) {
        // Handle 403 Forbidden - User might be blocked
        toast.error("You have been blocked by the admin." ,{});
        setTimeout(() => logout() , 5000) // Redirect after 5 seconds
        return Promise.reject(error);
      }

      // Handle token expiration
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post<TokenResponse>(
            "http://localhost:5000/api/doctor/refresh-token",
            {},
            { withCredentials: true }
          );

          const { accessToken } = refreshResponse.data.tokens;
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return doctorApi(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          toast.error("Session expired. Please log in again.");
          setTimeout(() => logout(), 5000);
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error)
  }
);

export default doctorApi;
