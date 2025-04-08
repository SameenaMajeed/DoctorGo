import axiosUser from '../axios/UserInstance'

export const bookAppointment = async (appointmentData : any) => {
    try {
      const response = await axiosUser.post("/api/appointments", appointmentData);
      return response.data;
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw error;
    }
  };

// import userRoutes from '../EndPoints/UserEndPoints';
// import { SignIn } from '../Interfaces/UserInterfaces/SignInInterface';
// import { SignUp } from '../Interfaces/UserInterfaces/SignUpInterface';

// interface ISignUpResponse {
//     success: boolean;
//     message: string;
//     email?: string | null;
//     id?: string | null;
//     name?: string;
//     phone?: string;
//     gender?:string ;
// }

// //api sends sign in data to the server
// const signInApi = async(formData : SignIn) =>{
//     try {

//         const response = await axiosUser.post(userRoutes.sign_in, formData)
//         return {
//             success: true,
//             message: "Sucessfully signed Into Account",
//             email: response.data.email,
//             name: response.data.name,
//             id: response.data.id,
//             gender: response.data.gender,
//             phone: response.data.phone,
//         };
        
//     } catch (error: any) {
//         console.log(error.message);
//         return {
//             success: false,
//             message: error.response.data.message,
//         };
//     }
// }

// //api sends signup data to the server
// const signUpApi = async (formData : SignUp) : Promise<ISignUpResponse> => {
//     try {
//         const response = await axiosUser.post(userRoutes.sign_up , formData)
//         return { success: true, message: "Sucessfully Created Account", email: response.data.data };
        
//     } catch (error: any) {
//         console.log(error.message);
//         return { success: false, message: error.response.data.message || "something went wrong" };
//     }
// }

// //api to send otp to server for account verification
// const otpVerifyApi = async (otp: string, email: string) => {
//     try {
//         const response = await axiosUser.post(userRoutes.otp_verify, { otp: otp, email: email });
//         return {
//             success: true,
//             message: "Please Sign to continue",
//             data: null,
//         };
//     } catch (error: any) {
//         console.log(error.message);
//         return {
//             success: false,
//             message: error.response.data.message,
//             data: null,
//         };
//     }
// };

// //api to resend otp
// const otpResendApi = async (email: string) => {
//     try {
//         const response = await axiosUser.post(userRoutes.otp_resend, { email: email });

//         return {
//             success: true,
//             message: response.data.message,
//             data: null,
//         };
//     } catch (error: any) {
//         console.log(error.message);
//         return {
//             success: false,
//             message: error.response.data.message,
//             data: null,
//         };
//     }
// };

// //api to send otp to server for forgot password email verification
// const forgotOtpVerifyApi = async (otp: string, email: string) => {
//     try {
//         const response = await axiosUser.post(userRoutes.forgot_otp_verify, {
//             otp: otp,
//             email: email,
//         });
//         console.log(response.data.message);
//         return {
//             success: true,
//             message: response.data.message,
//             data: null,
//         };
//     } catch (error: any) {
//         console.log(error.message);
//         return {
//             success: false,
//             message: error.response.data.message,
//             data: null,
//         };
//     }
// };

// //api logouts user clears access and refresh tokens
// const logoutUser = async () => {
//     try {
//         const response = await axiosUser.get(userRoutes.logout);

//         return {
//             success: true,
//             message: response.data.message,
//             data: null,
//         };
//     } catch (error: any) {
//         console.log(error.message);
//         return {
//             success: false,
//             message: error.response.data.message,
//             data: null,
//         };
//     }
// };

// //api for refreshing access token
// const refreshTokenApi = async () => {
//     try {
//         const response = await axiosUser.post(userRoutes.refresh_token);
//     } catch (error: any) {
//         console.log(error.message);
//     }
// };

// export {
//     signInApi,
//     signUpApi,
//     otpVerifyApi,
//     otpResendApi,
//     logoutUser,
//     refreshTokenApi,
// }