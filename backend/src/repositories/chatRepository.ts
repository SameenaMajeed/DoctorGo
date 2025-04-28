import messageModel from "../models/messageModel";
import userModel from "../models/userModel";
import doctorModel from "../models/DoctorModel";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/Httpstatus";
import { MessageConstants } from "../constants/MessageConstants";

export class ChatRepository {
  async getUsersWhoMessaged(doctorId: string): Promise<string[]> {
    try {
      const doctor = await doctorModel.findById(doctorId).lean();
      if (!doctor) {
        throw new AppError(HttpStatus.NotFound, "Doctor not found");
      }
      const userIds = await messageModel.distinct("userId", { doctorId }).exec();
      return userIds;
    } catch (error) {
      throw error instanceof AppError
        ? error
        : new AppError(
            HttpStatus.InternalServerError,
            `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
          );
    }
  }

  // async getDoctorsWhoMessaged(userId: string): Promise<string[]> {
  //   try {
  //     const user = await userModel.findById(userId).lean();
  //     if (!user) {
  //       throw new AppError(HttpStatus.NotFound, "User not found");
  //     }
  //     const doctorIds = await messageModel.distinct("doctorId", { userId }).exec(); // Fetch all doctors
  //     return doctorIds;
  //     // const doctorIds = await messageModel.distinct("doctorId", { userId }).exec();
  //     // return doctorIds;
  //   } catch (error) {
  //     throw error instanceof AppError
  //       ? error
  //       : new AppError(
  //           HttpStatus.InternalServerError,
  //           `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
  //         );
  //   }
  // }

  async getDoctorsWhoMessaged(userId: string): Promise<string[]> {
    try {
      const user = await userModel.findById(userId).lean();
      if (!user) {
        throw new AppError(HttpStatus.NotFound, "User not found");
      }
      // Fetch all doctor IDs from the doctorModel
      const doctorIds = await doctorModel.distinct("_id").exec();
      return doctorIds.map(id => id.toString());
    } catch (error) {
      throw error instanceof AppError
        ? error
        : new AppError(
            HttpStatus.InternalServerError,
            `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
          );
    }
  }

  async getUserDetails(
    userIds: string[]
  ): Promise<
    {
      id: string;
      name: string;
      mobile_no?: string;
      profilePicture?: string;
      lastMessage?: string;
      lastMessageTime?: Date;
    }[]
  > {
    try {
      const users = await userModel
        .find({ _id: { $in: userIds } }, "name mobile_no profilePicture")
        .lean();
      const result = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await messageModel
            .findOne({ userId: user._id })
            .sort({ timestamp: -1 })
            .lean();
          return {
            id: user._id.toString(),
            name: user.name,
            mobile_no: user.mobile_no || undefined,
            profilePicture: user.profilePicture || undefined,
            lastMessage: lastMessage?.message,
            lastMessageTime: lastMessage?.timestamp,
          };
        })
      );
      return result;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getDoctorDetails(
    doctorIds: string[]
  ): Promise<
    {
      id: string;
      name: string;
      profilePicture?: string;
      lastMessage?: string;
      lastMessageTime?: Date;
    }[]
  > {
    try {
      const doctors = await doctorModel
        .find({ _id: { $in: doctorIds } }, "name mobile_no profilePicture")
        .lean();
      const result = await Promise.all(
        doctors.map(async (doctor) => {
          const lastMessage = await messageModel
            .findOne({ doctorId: doctor._id })
            .sort({ timestamp: -1 })
            .lean();
          return {
            id: doctor._id.toString(),
            name: doctor.name,
            profilePicture: doctor.profilePicture || undefined,
            lastMessage: lastMessage?.message,
            lastMessageTime: lastMessage?.timestamp,
          };
        })
      );
      console.log('result:',result)
      return result;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  // async getAllDoctors(): Promise<string[]> {
  //   try {
  //     const doctors = await doctorModel.find({}, "_id").lean();
  //     return doctors.map(doctor => doctor._id.toString());
  //   } catch (error) {
  //     throw new AppError(
  //       HttpStatus.InternalServerError,
  //       `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
  //     );
  //   }
  // }

  async findMessagesByUserAndDoctor(userId: string, doctorId: string): Promise<any[]> {
    try {
      const user = await userModel.findById(userId).lean();
      const doctor = await doctorModel.findById(doctorId).lean();
      if (!user || !doctor) {
        throw new AppError(HttpStatus.NotFound, "User or doctor not found");
      }
      return await messageModel.find({ userId, doctorId }).sort({ timestamp: 1 }).lean().exec();
    } catch (error) {
      throw error instanceof AppError
        ? error
        : new AppError(
            HttpStatus.InternalServerError,
            `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
          );
    }
  }
}