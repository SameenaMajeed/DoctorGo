import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Doctor {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  role?: "doctor";
  image?: string;
  specialization?: string;
  accessToken?: string;
}

interface DoctorState {
  doctor: Doctor | null;
  profile: Doctor | null;
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctor: null,
  profile: null,
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    setDoctor: (state, action: PayloadAction<Doctor>) => {
      state.doctor = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<Doctor>) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logoutDoctor: (state) => {
      state.doctor = null;
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setDoctor, setProfile, setError, logoutDoctor } =
  doctorSlice.actions;

export default doctorSlice.reducer;
