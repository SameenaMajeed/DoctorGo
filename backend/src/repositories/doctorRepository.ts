import { IDoctor } from "../models/DoctorModel";
import { IDoctorRepository } from "../interfaces/doctor/doctorRepositoryInterface";
import DoctorModel from "../models/DoctorModel";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/Httpstatus";
import { MessageConstants } from "../constants/MessageConstants";
import mongoose from "mongoose";

export class DoctorRepository implements IDoctorRepository {
  // Find doctor by email
  public async findByEmail(email: string): Promise<IDoctor | null> {
    return DoctorModel.findOne({ email }).lean();
  }

  // Find doctor by registration number
  public async findByRegistrationNumber(registrationNumber: string): Promise<IDoctor | null> {
    return DoctorModel.findOne({ registrationNumber }).lean();
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

  async updateProfilePicture(doctorId: string, profilePicture: string): Promise<IDoctor | null> {
    try {
      const updatedDoctor = await DoctorModel.findByIdAndUpdate(
        doctorId,
        { profilePicture },
        { new: true }
      ).exec();
      if (!updatedDoctor) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.DOCTOR_NOT_FOUND);
      }
      return updatedDoctor;
    } catch (error: unknown) {
      console.error('Error in updateProfilePicture:', error);
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }


  // Update doctor's verification status
  async updateVerificationStatus(
    doctorId: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<IDoctor | null> {
    const updateData: any = {
      verificationStatus: status,
      verificationNotes: notes
    };

    // If status is 'approved', also update isApproved
    if (status === 'approved') {
      updateData.isApproved = true;
      updateData.verifiedAt = new Date();
    } else if (status === 'rejected') {
      updateData.isApproved = false;
      updateData.verifiedAt = new Date();
    }

    return DoctorModel.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true }
    );
  }

  // Update doctor's block status
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
    }, { new: true });
  }

  async findAll(filter: any, skip: number, limit: number): Promise<any[]> {
    return await DoctorModel.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findAllPending(filter: any, skip: number, limit: number): Promise<any> {
    return DoctorModel.find({ ...filter, verificationStatus: 'pending' })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countAll(filter: any): Promise<number> {
    return DoctorModel.countDocuments(filter);
  }

  async updateProfile(doctorId: string, updatedData: any): Promise<any> {
    return await DoctorModel.findByIdAndUpdate(doctorId, updatedData, { new: true });
  }
  
  async findAllDoctor(): Promise<IDoctor[]> {
    try {
      return await DoctorModel.find().exec();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

   //get doctor data with id
   async getDoctorDataWithId(id: string): Promise<IDoctor | null> {
    try {
        const _id = new mongoose.Types.ObjectId(id);
        const data = await DoctorModel.findOne({ _id: _id });

        return data;
    } catch (error: any) {
        console.log(error.message);
        return null;
    }
}
}




// import { IDoctor } from "../models/DoctorModel";
// import { IDoctorRepository } from "../interfaces/doctor/doctorRepositoryInterface";
// import DoctorModel from "../models/DoctorModel";
// import { AppError } from "../utils/AppError";
// import { HttpStatus } from "../constants/Httpstatus";
// import { MessageConstants } from "../constants/MessageConstants";

// export class DoctorRepository implements IDoctorRepository {
//   // Find doctor by email
//   public async findByEmail(email: string): Promise<IDoctor | null> {
//     return DoctorModel.findOne({ email }).lean();
//   }

//   // Create a new doctor
//   public async create(doctorData: Partial<IDoctor>): Promise<IDoctor> {
//     return DoctorModel.create(doctorData);
//   }

//   async findById(doctorId: string): Promise<any> {
//     return DoctorModel.findById(doctorId);
//   }

//   async save(doctor: IDoctor): Promise<IDoctor> {
//     return await doctor.save();
//   }

//   // Update doctor's approval status

//   async updateDoctorStatus(
//     doctorId: string,
//     isBlocked: boolean,
//     blockReason?: string
//   ): Promise<IDoctor | null> {
//     return DoctorModel.findByIdAndUpdate(doctorId, {
//       isBlocked,
//       ...(isBlocked && { blockReason }), 
//       // Clear blockReason when unblocking (optional)
//       ...(!isBlocked && { blockReason: null }),
//     },{new : true});
//   }

//   async findAll(filter: any, skip: number, limit: number): Promise<any[]> {
//     return await DoctorModel.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .exec();
//   }

//   async findAllPending(filter: any, skip: number, limit: number): Promise<any> {
//     return DoctorModel.find(filter)
//         .skip(skip)
//         .limit(limit)
//         .lean();
//   }

//   async countAll(filter: any): Promise<number> {
//       return DoctorModel.countDocuments(filter)
//   }

//   async updateProfile(doctorId : string , updatedData : any) : Promise<any> {
//     return await DoctorModel.findByIdAndUpdate(doctorId , updatedData , {new : true})
//   }
  
//   async findAllDoctor(): Promise<IDoctor[]> {
//     try {
//       return await DoctorModel.find().exec();
//     } catch (error) {
//       console.error('Error in findAll:', error);
//       throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
//     }
//   }

// }
