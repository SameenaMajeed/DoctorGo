import { IAdminRepository } from "../interfaces/admin/adminRepositoryInterface";
import adminModel from "../models/adminModel";
import { IAdmin } from "../models/adminModel";

export class AdminRepository implements IAdminRepository {
    async findByEmail(email: string): Promise<IAdmin | any> {
        return await adminModel.findOne({email})
    }
}