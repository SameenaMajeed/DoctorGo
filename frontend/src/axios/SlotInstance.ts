import axios from 'axios';
import { store } from '../slice/Store/Store'; // Adjust path to your Redux store
import toast from 'react-hot-toast';
import { logoutDoctor } from '../slice/Doctor/doctorSlice';

// Interface for token refresh response
interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Create Axios instance for slots
const slotApi = axios.create({
  baseURL: 'http://localhost:5000/api/slots', // Adjust to your slot API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (e.g., refresh token) with requests
});

// Logout function
const logout = (): void => {
  console.log('Logging out the doctor...');
  const dispatch = store.dispatch;
  dispatch(logoutDoctor());
  toast.error('Your session has expired. Please log in again.');
  window.location.href = '/doctor/login'; // Adjust redirect path
};

// Response interceptor with token refresh logic
slotApi.interceptors.response.use(
  (response) => {
    console.log('Slot API response received successfully:', response);
    return response;
  },
  async (error) => {
    console.log('Error received in slotApi interceptor:', error);

    const originalRequest = error.config;

    // Handle 304 Not Modified responses
    if (error.response && error.response.status === 304) {
      console.log('Resource not modified. Returning cached data.');
      return Promise.resolve(error.response);
    }

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Skip refresh if credentials are invalid
      if (
        error.response.data.message ===
        'Login failed. Please check your credentials.'
      ) {
        console.log('Invalid credentials. Skipping token refresh.');
        toast.error('Login failed. Please check your credentials.');
        return Promise.reject(error);
      }

      // Attempt token refresh if not already retried
      if (!originalRequest._retry) {
        console.log('Token expired. Attempting to refresh token...');
        originalRequest._retry = true;

        try {
          console.log('Sending request to refresh token...');
          const refreshResponse = await axios.post<TokenResponse>(
            'http://localhost:5000/api/doctor/refresh-token', // Adjust refresh token endpoint
            {},
            { withCredentials: true } // Send refresh token cookie
          );

          if (refreshResponse.data && refreshResponse.data.tokens) {
            const { accessToken } = refreshResponse.data.tokens;
            console.log('New access token received:', accessToken);

            // Update original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            console.log('Retrying original request with new access token...');
            return slotApi(originalRequest);
          } else {
            console.error(
              'Refresh token response missing tokens:',
              refreshResponse.data
            );
            toast.error('Failed to refresh token. Please log in again.');
            throw new Error('Invalid refresh response');
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          console.log('Refresh token failed. Logging out...');
          logout();
          return Promise.reject(refreshError);
        }
      }
    }

    // Handle other errors
    console.error('Unhandled error in slotApi interceptor:', error);
    toast.error('An unexpected error occurred. Please try again.');
    return Promise.reject(error);
  }
);

export default slotApi;