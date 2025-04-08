import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the Doctor interface
interface Doctor {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  role?: "doctor";
  profilePicture?: string | null;
  specialization?: string;
  accessToken?: string;
  isApproved?: boolean;
  approvalStatus?: string;
  ticketPrice?: number,
  extraCharge ?: number,
  bio ?: string,
}

// Define the state interface
interface DoctorState {
  doctor: Doctor | null;
  profile: Doctor | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initialize state
const initialState: DoctorState = {
  doctor: null,
  profile: null,
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
    setDoctor: (state, action: PayloadAction<Doctor>) => {
      state.doctor = action.payload;
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
        state.doctor = {
          ...state.doctor, // Ensures that doctor is treated as an object
          isApproved: action.payload.isApproved,
          approvalStatus: action.payload.approvalStatus,
        };
      }
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

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface Doctor {
//   _id?: string;
//   name: string;
//   email: string;
//   phone?: string;
//   qualification?: string;
//   role?: "doctor";
//   image?: string;
//   specialization?: string;
//   accessToken?: string;
// }

// interface DoctorState {
//   doctor: Doctor | null;
//   profile: Doctor | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: DoctorState = {
//   doctor: null,
//   profile: null,
//   loading: false,
//   error: null,
// };

// const doctorSlice = createSlice({
//   name: "doctor",
//   initialState,
//   reducers: {
//     setLoading: (state) => {
//       state.loading = true;
//     },
//     setDoctor: (state, action: PayloadAction<Doctor>) => {
//       state.doctor = action.payload;
//       state.loading = false;
//       state.error = null;
//     },
//     setProfile: (state, action: PayloadAction<Doctor>) => {
//       state.profile = action.payload;
//       state.loading = false;
//       state.error = null;
//     },
//     setError: (state, action: PayloadAction<string>) => {
//       state.error = action.payload;
//       state.loading = false;
//     },
//     logoutDoctor: (state) => {
//       state.doctor = null;
//       state.profile = null;
//       state.loading = false;
//       state.error = null;
//     },
//   },
// });

// export const { setLoading, setDoctor, setProfile, setError, logoutDoctor } =
//   doctorSlice.actions;

// export default doctorSlice.reducer;
