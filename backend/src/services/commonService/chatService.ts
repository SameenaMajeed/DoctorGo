import { AppError } from '../../utils/AppError';
import { HttpStatus } from '../../constants/Httpstatus';
import { MessageConstants } from '../../constants/MessageConstants';
import { ChatRepository } from '../../repositories/commonRepository/chatRepository';
// import userModel from '../../models/userModel/userModel';

export class ChatService {
    private chatRepository: ChatRepository;
  
    constructor() {
      this.chatRepository = new ChatRepository();
    }

    async getUsersWhoMessaged(doctorId: string): Promise<{ id: string; name: string; mobile_no?: string; profilePicture?: string }[]> {
        try {
          const userIds = await this.chatRepository.getUsersWhoMessaged(doctorId);
          if (!userIds.length) {
            return [];
          }
          const users = await this.chatRepository.getUserDetails(userIds);
          return users;
        } catch (error) {
          if (error instanceof AppError) throw error;
          throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    // async getDoctorsWhoMessaged(userId: string): Promise<{ id: string; name: string; profilePicture?: string }[]> {
    //   try {
    //     const user = await userModel.findById(userId).lean();
    //     if (!user) {
    //       throw new AppError(HttpStatus.NotFound, "User not found");
    //     }
    //     const doctorIds = await this.chatRepository.getAllDoctors(); // Fetch all doctors
    //     console.log('doctorIds:', doctorIds);
    //     if (!doctorIds.length) {
    //       return [];
    //     }
    //     const doctors = await this.chatRepository.getDoctorDetails(doctorIds);
    //     console.log('doctors from service:', doctors);
    //     return doctors;
    //   } catch (error) {
    //     if (error instanceof AppError) throw error;
    //     throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    //   }
    // }

    async getDoctorsWhoMessaged(userId: string): Promise<{ id: string; name: string; profilePicture?: string }[]> {
      try {
        const doctorIds = await this.chatRepository.getDoctorsWhoMessaged(userId);
        console.log('doctorIds:',doctorIds)
        if (!doctorIds.length) {
          // return [];
        }
        const doctors = await this.chatRepository.getDoctorDetails(doctorIds);
        console.log('doctors from service:',doctors)
        return doctors;
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
}  