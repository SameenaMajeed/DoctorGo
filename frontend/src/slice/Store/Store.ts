import { configureStore } from "@reduxjs/toolkit";
import { persistStore , persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage'
import userReducer from '../user/userSlice'
import otpReducer from '../Otp/otpSlice'
import adminReducer from '../admin/adminSlice'
import doctorReducer from '../Doctor/doctorSlice'
import { combineReducers } from "@reduxjs/toolkit";
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

const persistConfig = {
    key : 'root',
    storage,
    whitelist: ['user', 'admin','doctor'],
}

// combine user reducer
const rootReducer = combineReducers({
    user : userReducer,
    otp: otpReducer,
    admin: adminReducer,
    doctor : doctorReducer,
})

const persistedReducer = persistReducer(persistConfig , rootReducer)

// configure store
const store = configureStore({
    reducer : persistedReducer,
    middleware : (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck : false
        })
})


// create persistor
export const persistor = persistStore(store)

// type definitions
export type RootState = ReturnType<typeof store.getState> // This provides the shape of the entire Redux state
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;  


export {store }