import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface User {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
    mobile_no : string;
    address:string;
    gender:string;
    DOB:string;
    accessToken?: string;
}

interface UserState {
  user: User | null;
  profile: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  profile : null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<User>) => {
          state.profile = action.payload;
          state.loading = false;
          state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("userProfile");
    },
  },
});

export const { setLoading, setUser, setError, logoutUser ,setProfile} = userSlice.actions;

export default userSlice.reducer;
