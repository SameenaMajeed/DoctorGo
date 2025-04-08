import { Request, Response, NextFunction } from "express";
import DoctorModel from "../models/DoctorModel";
import { HttpStatus } from "../constants/Httpstatus";

const blockedDoctorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get doctorId from authenticated user data
    const doctorId = req.data?.id;
    
    if (!doctorId) {
      next();
      return;
    }

    const doctor = await DoctorModel.findById(doctorId);

    if (doctor?.isBlocked) {
      res.status(HttpStatus.Forbidden).json({ 
        message: "Your account has been blocked by Admin",
        reason: doctor.blockReason || "Contact admin for more information"
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error("Error in blocked doctor middleware:", error);
    next(error);
  }
};

export default blockedDoctorMiddleware;