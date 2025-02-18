import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface User {
    name: string;
    email: string;
    accessToken?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
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

export const { setLoading, setUser, setError, logoutUser} = userSlice.actions;

export default userSlice.reducer;

// type InitialState = {
//     currentUser: User | null;
//     loading:boolean;
//     error:string | undefined;
//     token:string | null
// }

// const initialState:InitialState = {
//     currentUser : null,
//     loading:false,
//     error:undefined,
//     token:null
// }

// const UserSlice = createSlice({
//     name:'user',
//     initialState,
//     reducers:{
//         signInStart : (state) => {
//             state.loading = true
//         },
//         signInSuccess : (state,action:PayloadAction<{ data: User, token: string }>) => {
//             state.currentUser = action.payload.data;
//             state.token = action.payload.token
//             state.loading = false;
//             state.error = undefined;
//         },
//         signInFailure: (state,action:PayloadAction<string | undefined>)=>{
//             state.loading = false;
//             state.error = action.payload
//         },
//         updateSuccess:(state,action:PayloadAction<{data:User}>) =>{
//             state.currentUser = action.payload.data;
//             state.loading=false;
//             state.error = undefined;
//         },
//         signOut : (state) => {
//             state.currentUser = null;
//             state.token = null;
//             state.loading = false;
//             state.error = undefined;
//         }
//     }
// });

// export const {signInStart , signInSuccess , signInFailure,updateSuccess ,signOut} = UserSlice.actions;

// export default UserSlice.reducer;
