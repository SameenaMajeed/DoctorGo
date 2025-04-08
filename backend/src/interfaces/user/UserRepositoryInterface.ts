 
import { IDoctor } from '../../models/DoctorModel';
import { IUser } from '../../models/userModel';

export interface UserRepositoryInterface {
  create(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  findAll(filer: any , skip: number, limit: number): Promise<IUser[]>;
  countAll(filter : any): Promise<number>;
  findById(userId: string): Promise<IUser | null>;
  save(user:IUser):Promise<IUser>
  updateProfilePicture(userId: string, profilePicture: string): Promise<any>;
  

}