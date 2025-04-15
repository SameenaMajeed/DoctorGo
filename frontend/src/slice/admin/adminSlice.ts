import { createSlice } from "@reduxjs/toolkit";

interface AdminState {
  _id: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
}

const initialState: AdminState = {
  _id: null,
  email: null,
  loading: false,
  accessToken: null,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLogin: (state, action) => {
      state._id = action.payload._id;
      state.accessToken = action.payload.accessToken;
      state.email = action.payload.email;
      state.loading = false;
      state.error = null;
    },
    adminLogout: (state) => {
      state._id = null;
      state.email = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },
    clearAdminState: (state) => {
      state._id = null;
      state.email = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { adminLogin, adminLogout, clearAdminState } = adminSlice.actions;

export default adminSlice.reducer;
