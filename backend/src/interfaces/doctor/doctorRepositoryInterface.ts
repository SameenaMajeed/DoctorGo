import { IDoctor } from "../../models/DoctorModel";

export interface IDoctorRepository {
    findByEmail(email : string) :Promise<IDoctor | null>;
    create(doctorData: Partial<IDoctor>): Promise<IDoctor>;
    findById(doctorId: string): Promise<IDoctor | null>;
    save(doctor: IDoctor): Promise<IDoctor>;
    updateDoctorStatus(doctorId : string , isBlocked: boolean,blockReason?: string): Promise<IDoctor | null>;
    findAll(filter: any, skip: number, limit: number): Promise<any[]>;
    findAllPending(filter: any, skip: number, limit: number): Promise<any>;
     // Updated countAll method to accept optional search and filter parameters.
    countAll(filter: any): Promise<number>;
    updateProfile(doctorId : string , updatedData : any) : Promise<any>;
}