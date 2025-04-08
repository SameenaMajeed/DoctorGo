import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";

const blockedUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("req.body:", req.body);
    console.log("req.query:", req.query);
    
    const email = req.body.email || req.query.email;

    console.log("email in blocked middleware", email);
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
