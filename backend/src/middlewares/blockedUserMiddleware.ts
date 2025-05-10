import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";

const blockedUserMiddleware = async (
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
    const user = await User.findOne({ email });

    if (user && user.isBlocked) {
      res.status(403).json({ message: "User is blocked by Admin." });
      return;
    }

    return next();
  } catch (error: any) {
    console.error(error.message);

    return next(error);
  }
};

export default blockedUserMiddleware;
