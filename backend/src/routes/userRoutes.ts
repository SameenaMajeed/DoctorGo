import express, { Router, Request, Response } from 'express';
import { Usercontroller } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authentication';
import { UserRepository } from '../repositories/userRepository'
import { UserService } from '../services/userServices';
import { OtpRepository } from '../repositories/otpRepository';
import blockedUserMiddleware from '../middlewares/blockedUserMiddleware';
const userRoute: Router = express.Router();
const userRepository=new UserRepository()
const otpRepository=new OtpRepository()
const userService=new UserService(userRepository,otpRepository)

const userController = new Usercontroller(userService );

 
// Register user
userRoute.post('/register', (req: Request, res: Response) => {
  userController.registerUser(req, res);
});

 
// User login
userRoute.post('/login',blockedUserMiddleware,   (req: Request, res: Response) => {
  userController.signIn(req, res);
});



// Refresh access token
userRoute.post('/refresh-token', (req: Request, res: Response) => {
  userController.refreshAccessToken(req, res);
});


userRoute.post('/forgot-password', (req: Request, res: Response) => {
  userController.forgotPassword(req, res);
});

userRoute.post('/reset-password',(req: Request, res: Response)=>{
  userController.resetPassword(req,res)
})

userRoute.post('/logout',(req,res)=>userController.logout(req,res))


export default userRoute;