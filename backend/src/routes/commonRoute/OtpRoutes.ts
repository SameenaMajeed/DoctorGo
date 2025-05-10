import express, { Router } from 'express';

import { OtpController } from '../../controllers/commonController/OtpController';
import { OtpService } from '../../services/commonService/OtpServices';
import { OtpRepository } from '../../repositories/commonRepository/otpRepository';

const otpRepository=new OtpRepository()
const otpService=new OtpService( otpRepository )
const otpController = new OtpController(otpService);
const otpRoute: Router = express.Router();




otpRoute.post('/send', (req, res) => otpController.sendOtp(req, res));

otpRoute.post('/verify', (req, res) => otpController.verifyOtp(req, res));

otpRoute.post('/resend', (req, res) => otpController.resendOtp(req, res));

 

export default otpRoute;