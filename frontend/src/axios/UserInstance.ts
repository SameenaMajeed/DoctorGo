import axios from "axios";
import { store } from "../slice/Store/Store";
import { logoutUser } from "../slice/user/userSlice";
import { toast } from "react-hot-toast";

interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Set up Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/users", // Backend API URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

// Logout function
const logout = (): void => {
  console.log("Logging out the user...");
  const dispatch = store.dispatch;

  // Dispatch the logout action to clear user state
  dispatch(logoutUser());

  // Redirect to login route
  window.location.href = "/login";
};

api.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip interceptor logic for login requests
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

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Mark the request as retried to avoid an infinite loop

        try {
          const refreshResponse = await axios.post<TokenResponse>(
            "http://localhost:5000/api/users/refresh-token",
            {},
            { withCredentials: true } // Send cookies along with the request
          );

          const { accessToken } = refreshResponse.data.tokens; // Retrieve the new access token

          // Retry the original request with the new access token in the Authorization header
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          toast.error('Session expired. Please log in again.', {
            duration: 5000, // Display the toast for 5 seconds
          });
          setTimeout(() => logout(), 5000); // Redirect after 5 seconds
          return Promise.reject(refreshError);
        }
      }
    }

    // For other errors, reject the promise
    return Promise.reject(error);
  }
);

export default api;
