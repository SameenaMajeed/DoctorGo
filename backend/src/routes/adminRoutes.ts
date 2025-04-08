import  express , {Router , Request , Response} from "express";

import { authenticateToken } from "../middlewares/authentication";

import AdminController from "../controllers/adminController";
import AdminService from "../services/AdminService";

import { AdminRepository } from "../repositories/AdminRepositry";
import { DoctorRepository } from "../repositories/doctorRepository";
import { UserRepository } from "../repositories/userRepository";


const adminRoute : Router = express.Router()

const doctorRepository = new DoctorRepository()
const userRepository = new UserRepository()
const adminRepository = new AdminRepository()

const adminService = new AdminService(adminRepository , userRepository , doctorRepository)
const adminController = new AdminController(adminService)


adminRoute.post('/login' , (req:Request,res:Response)=>{
    adminController.login(req , res)
})
adminRoute.get('/pending' , authenticateToken('admin') , (req:Request,res:Response)=>{
    adminController.getPendingDoctor(req , res)
})


adminRoute.post(
    
    "/approve",
    authenticateToken("admin"),
    (req: Request, res: Response) => {
      adminController.updateDoctorVerificationStatus(req, res);
    }
  );

// adminRoute.post('/update-status' , (req:Request,res:Response)=>{
//     adminController.updateDoctorStatus(req , res)
// })
adminRoute.post('/refresh-token' , (req:Request,res:Response)=>{
    adminController.refreshAccessToken(req , res)
})
adminRoute.post('/logout' , (req:Request,res:Response)=>{
    adminController.logout(req , res)
})
adminRoute.get('/doctor' , authenticateToken('admin') , (req:Request,res:Response)=>{
    adminController.getAllDoctors(req , res)
})
adminRoute.get('/users' , authenticateToken('admin') , (req:Request,res:Response)=>{
    adminController.getAllUsers(req , res)
})
adminRoute.post('/block-doctor' , authenticateToken('admin') , (req:Request,res:Response)=>{
    adminController.blockDoctor(req , res)
})
adminRoute.post('/block-user' , authenticateToken('admin') , (req:Request,res:Response)=>{
    adminController.blockUser(req , res)
})


export default adminRoute










