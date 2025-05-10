
import { UserRepositoryInterface } from '../../interfaces/user/UserRepositoryInterface';
import User, { IUser } from '../../models/userModel/userModel';
import { googleUserData } from '../../types/google';
import Doctor , {IDoctor} from '../../models/doctorMpdel/DoctorModel';
import { BaseRepository } from '../commonRepository/BaseRepository';
import mongoose from 'mongoose';

export class UserRepository extends BaseRepository<IUser> implements UserRepositoryInterface {
  constructor() {
    super(User);
  }
  // Create a new user (standard or Google)
  async create(user: Partial<IUser> | googleUserData): Promise<IUser> {
    try {
      // If the user is coming from Google Sign-In, add the google_id
      if ('uid' in user) {
        const googleUser: googleUserData = user;
        const newUser = new User({
          name: googleUser.name,
          email: googleUser.email,
          google_id: googleUser.uid,
          is_verified: googleUser.email_verified,
          is_blocked: false, // Default to false
        });

        const savedUser = await newUser.save();
        console.log('After Save (Google User):', savedUser);  
        return savedUser;
      } else {
 
        const newUser = new User({
          ...user,
        });
        console.log('Before Save (Standard User):', newUser);
        const savedUser = await newUser.save();
        console.log('After Save (Standard User):', savedUser);  
        return savedUser;
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Unable to save user');
    }
  }

  // Find user by email, returning IUser
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  // Find user by Google ID, returning IUser
  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await User.findOne({ google_id: googleId });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.password = hashedPassword;
        await user.save();
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error('Error updating password');
    }
  }

  // async findAll(skip:number,limit:number): Promise<any[]> {
  //  return await User.find().skip(skip).limit(limit).exec()
  // }
  async countAll(): Promise<number> {
    return await User.countDocuments();
  }

  async findById(userId: string): Promise<IUser | null> {
    try {
      // Search for the user by ID
      const user = await User.findById(userId).exec();
      
 
      if (!user) {
        return null;
      }
      
 
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Error finding user');
    }
  }
  async updateProfilePicture(userId: string, profilePicture: string) {
    return await User.findByIdAndUpdate(userId, { profilePicture }, { new: true });
  }

  async save(user:IUser):Promise<IUser>{
    return await user.save()
  }

  //get user data with id
  async getUserDataWithId(id: string): Promise<Partial<IUser> | null> {
    try {
        const _id = new mongoose.Types.ObjectId(id);

        const data = await User.findOne({ _id: _id });

        return data;
    } catch (error: any) {
        console.log(error.message);
        return null;
    }
}


  // async updateProfilePicture(userId: string, profilePicture: string): Promise<IUser | null> {
  //   try {
  //     const updatedUser = await User.findByIdAndUpdate(
  //       userId,
  //       { profilePicture },
  //       { new: true }
  //     ).exec();
  //     if (!updatedUser) {
  //       throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
  //     }
  //     return updatedUser;
  //   } catch (error: unknown) {
  //     console.error('Error in updateProfilePicture:', error);
  //     if (error instanceof AppError) throw error;
  //     const errorMessage = error instanceof Error 
  //       ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
  //       : MessageConstants.INTERNAL_SERVER_ERROR;
  //     throw new AppError(HttpStatus.InternalServerError, errorMessage);
  //   }
  // }
  
}

 
 
