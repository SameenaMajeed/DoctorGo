import { IDoctor } from "../../models/DoctorModel";

export interface ILoginResponse {
    doctor: IDoctor;
    accessToken: string;
    refreshToken: string;
    role: string;
}

export interface IDoctorService {
    registerDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor>;
    loginDoctor(email: string, password: string): Promise<ILoginResponse>;
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
    getDoctorProfile(doctorId : string) : Promise<IDoctor | null >;
    updatedDoctorProfile(doctorId : string , updatedData: Partial<IDoctor>): Promise<any>;
}