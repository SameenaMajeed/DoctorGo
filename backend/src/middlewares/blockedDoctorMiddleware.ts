import { Request, Response, NextFunction } from "express";
import DoctorModel from "../models/doctorMpdel/DoctorModel";
import { HttpStatus } from "../constants/Httpstatus";

const blockedDoctorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.data?.email || req.body.email;

    console.log("email : ", email);

    if (!email) {
      res
        .status(400)
        .json({ message: "Email is required to check block status" });
      return;
    }

    const doctor = await DoctorModel.findOne({ email: email });
    // console.log('fetching email:' ,doctor)

    if (doctor && doctor?.isBlocked) {
      res.status(HttpStatus.Forbidden).json({
        message: "Your account has been blocked by Admin",
        reason: doctor.blockReason || "Contact admin for more information",
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
