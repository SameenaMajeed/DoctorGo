import { createSlice, PayloadAction } from "@reduxjs/toolkit";



// Define the Doctor interface
interface Doctor {
  role: string | null;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  // role?: "doctor";
  profilePicture?: string | null;
  specialization?: string;
  accessToken?: string;
  refreshToken?: string;
  isApproved?: boolean;
  approvalStatus?: string;
  ticketPrice?: number,
  extraCharge ?: number,
  bio ?: string,
  [key: string]: any;
}

// Define the state interface
interface DoctorState {
  doctor: Doctor | null;
  profile: Doctor | null;
  isAuthenticated: boolean;
  role: string | null;
  loading: boolean;
  error: string | null;
}

// Initialize state
const initialState: DoctorState = {
  doctor: null,
  profile: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Create the slice
const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setDoctor: (state, action: PayloadAction<{
      doctor: Doctor;  // This should contain all doctor fields
      accessToken: string;
      refreshToken: string;
      role: string;
    }>) => {
      console.log('setDoctor payload:', action.payload);
      
      state.doctor = {
        ...action.payload.doctor,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      }
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<Doctor>) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutDoctor: (state) => {
      state.doctor = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.doctor) {
        state.doctor.profilePicture = action.payload
      }
    },
    updateDoctorApproval: (
      state,
      action: PayloadAction<{ isApproved: boolean; approvalStatus: string }>
    ) => {
      if (state.doctor) {
        state.doctor.isApproved = action.payload.isApproved;
        state.doctor.approvalStatus = action.payload.approvalStatus;
      }
      if (state.profile) {
        state.profile.isApproved = action.payload.isApproved;
        state.profile.approvalStatus = action.payload.approvalStatus;
      }
      // if (state.doctor) {
      //   state.doctor = {
      //     ...state.doctor, // Ensures that doctor is treated as an object
      //     isApproved: action.payload.isApproved,
      //     approvalStatus: action.payload.approvalStatus,
      //   };
      // }
    },
  },
});

// Export actions and reducer
export const {
  setLoading,
  setDoctor,
  setProfile,
  setError,
  logoutDoctor,
  updateDoctorApproval,
  updateProfilePicture
} = doctorSlice.actions;
export default doctorSlice.reducer;
