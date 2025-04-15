import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";

const blockedUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.data?.email || req.body.email;

    console.log('email : ' ,email)

    if (!email) {
      res.status(400).json({ message: 'Email is required to check block status' });
      return
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

// checkBlockedStatus.ts
// import { Request, Response, NextFunction } from "express";
// import { UserRepository } from "../repositories/userRepository";
// import { DoctorRepository } from "../repositories/doctorRepository";

// //create a user repository instance
// const userRepository = new UserRepository();
// //create a doctor repository instance
// const doctorRepository = new DoctorRepository();

// //middleware to check the block status of user and doctor
// const blockedUserMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// )  : Promise<void> =>{
//   try {
//     const id = req.data?.id;
//     const role = req.data?.role;
//     console.log('id:',id)
//     console.log('role:',role)

//     // Check if id and role are defined
//     if (!id || !role) {
//       res
//         .status(400)
//         .json({ message: "Missing user information", status: false });
//       return   
//     }

//     if (role === "user") {
//       const userData = await userRepository.getUserDataWithId(id);
//       console.log('User data:', userData);

//       if (userData?.isBlocked) {
//         res.status(401).json({ message: "Blocked by admin", status: false });
//       } else {
//         next();
//       }
//     } else if (role === "doctor") {
//       const doctorData = await doctorRepository.getDoctorDataWithId(id);
//       if (doctorData?.isBlocked) {
//         res.status(401).json({ message: "Blocked by admin", status: false });
//       } else {
//         next();
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", status: false });
//   }
// };

// export default blockedUserMiddleware;