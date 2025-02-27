import { IDoctor } from "../models/DoctorModel";
import { IDoctorRepository } from "../interfaces/doctor/doctorRepositoryInterface";
import DoctorModel from "../models/DoctorModel";

export class DoctorRepository implements IDoctorRepository {
  // Find doctor by email
  public async findByEmail(email: string): Promise<IDoctor | null> {
    return DoctorModel.findOne({ email }).lean();
  }

  // Create a new doctor
  public async create(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    return DoctorModel.create(doctorData);
  }

  async findById(doctorId: string): Promise<any> {
    return DoctorModel.findById(doctorId);
  }

  async save(doctor: IDoctor): Promise<IDoctor> {
    return await doctor.save();
  }

  // Update doctor's approval status

  async updateDoctorStatus(
    doctorId: string,
    isBlocked: boolean,
    blockReason?: string
  ): Promise<IDoctor | null> {
    return DoctorModel.findByIdAndUpdate(doctorId, {
      isBlocked,
      ...(isBlocked && { blockReason }), 
      // Clear blockReason when unblocking (optional)
      ...(!isBlocked && { blockReason: null }),
    },{new : true});
  }

  async findAll(filter: any, skip: number, limit: number): Promise<any[]> {
    return await DoctorModel.find(filter)
    .skip(skip)
    .limit(limit)
    .exec();
  }

  async findAllPending(filter: any, skip: number, limit: number): Promise<any> {
    return DoctorModel.find(filter)
        .skip(skip)
        .limit(limit)
        .lean();
  }

  async countAll(filter: any): Promise<number> {
      return DoctorModel.countDocuments(filter)
  }

  async updateProfile(doctorId : string , updatedData : any) : Promise<any> {
    return await DoctorModel.findByIdAndUpdate(doctorId , updatedData , {new : true})
  }
}
