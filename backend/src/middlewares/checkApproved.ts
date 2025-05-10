import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../constants/Httpstatus";
import { MessageConstants } from "../constants/MessageConstants";
import DoctorModel from "../models/doctorMpdel/DoctorModel";
import { sendError } from "../utils/responseUtils";

interface AuthenticatedRequest extends Request {
  data?: any;
}

export const checkApproved = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure the user is authenticated
    if (!req.data) {
      return sendError(res, HttpStatus.Unauthorized, "User not authenticated");
    }

    // Extract email from the authenticated user
    const email = req.data.email;

    // Fetch the user by email from the database
    const user = await DoctorModel.findOne({ email }).exec();

    if (!user) {
      return sendError(
        res,
        HttpStatus.NotFound,
        MessageConstants.USER_NOT_FOUND
      );
    }

    // Check if the doctor is approved
    if (!user.isApproved) {
      return sendError(
        res,
        HttpStatus.Forbidden,
        "Your account is pending approval by the admin."
      );
    }

    // Attach the user to the request object for further use
    req.data = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    console.error("Error in checkApproved middleware:", error);
    return sendError(
      res,
      HttpStatus.InternalServerError,
      MessageConstants.INTERNAL_SERVER_ERROR
    );
  }
};

// import { Request, Response, NextFunction } from 'express';
// import { HttpStatus } from '../constants/Httpstatus';
// import { sendError } from '../utils/responseUtils';
// import { MessageConstants } from '../constants/MessageConstants';
// import DoctorModel from '../models/DoctorModel';

// interface AuthenticatedRequest extends Request {
//     data?: any
// }

// export const checkApproved = async(req : AuthenticatedRequest, res: Response, next: NextFunction) =>{
//     try {
//         // Ensure the user is authenticated
//         if(!req.data){
//             return sendError(res, HttpStatus.Unauthorized, "User not authenticated");
//         }

//         // Extract email from the authenticated user
//         const email = req.data.email

//         // Fetch the user by email from the database
//         const user = await DoctorModel.findOne({email}).exec()

//         if (!user) {
//             return sendError(res, HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
//         }

//         // Attach the user to the request object for further use
//         req.data = user;

//         // Proceed to the next middleware or route handler
//         next();

//     } catch (error: any) {
//         console.error('Error in checkApproved middleware:', error);
//         return sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
//     }
// }
