import { IDoctor } from "../../models/doctorMpdel/DoctorModel";

export interface IDoctorRepository {
    findByEmail(email : string) :Promise<IDoctor | null>;
    findByRegistrationNumber(registrationNumber: string): Promise<IDoctor | null>
    create(doctorData: Partial<IDoctor>): Promise<IDoctor>;
    findById(doctorId: string): Promise<IDoctor | null>;
    save(doctor: IDoctor): Promise<IDoctor>;
    updateVerificationStatus(
        doctorId: string,
        status: 'pending' | 'approved' | 'rejected',
        notes?: string
      ): Promise<IDoctor | null>
    updateDoctorStatus(doctorId : string , isBlocked: boolean,blockReason?: string): Promise<IDoctor | null>;
    findAll(filter: any, skip: number, limit: number): Promise<any[]>;
    findAllPending(filter: any, skip: number, limit: number): Promise<any>;
     // Updated countAll method to accept optional search and filter parameters.
    countAll(filter: any): Promise<number>;
    updateProfile(doctorId : string , updatedData : any) : Promise<any>;
    findAllDoctor(): Promise<IDoctor[]>
    updateProfilePicture(doctorId: string, profilePicture: string): Promise<IDoctor | null> 

    
}
