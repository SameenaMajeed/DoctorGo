import { Request, Response } from "express";
import { IGoogleUserData } from "../../types/google";

import { IUserService } from "../../interfaces/user/userServiceInterface";
import { sendError, sendResponse } from "../../utils/responseUtils";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import admin from "../../config/firebase";
import { CookieManager } from "../../utils/cookieManager";
import { AppError } from "../../utils/AppError";

declare global {
  namespace Express {
    export interface Request {
      data?: {
        id: string;
        role: string;
        userId?: string;
        email?: string;
      };
    }
  }
}

export class Usercontroller {
  constructor(private _userService: IUserService) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, mobile_no } = req.body;

      // Calling the UserService to handle the business logic
      const newUser = await this._userService.registerUser(
        name,
        email,
        password,
        mobile_no
      );
      sendResponse(
        res,
        HttpStatus.Created,
        MessageConstants.USER_REGISTER_SUCCESS,
        {
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            mobile_no: newUser.mobile_no,
          },
        }
      );

      // res.status(201).json({
      //   message: "User registered successfully",
      //   user: {
      //     id: newUser._id,
      //     name: newUser.name,
      //     email: newUser.email,
      //     mobile_no: newUser.mobile_no,
      //   },
      // });
    } catch (error: any) {
      console.log(error.message);
      sendError(
        res,
        HttpStatus.BadRequest,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
      // res
      //   .status(500)
      //   .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );
      }

      const { user, accessToken, refreshToken } =
        await this._userService.authenticateUser(email, password);

      console.log("user:", user);

      CookieManager.setAuthCookies(res, { accessToken, refreshToken });

      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile_no: user.mobile_no,
          isBlocked: user.isBlocked,
        },
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.BadRequest,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
      // res.status(500).json({ message: error.message });
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        sendResponse(
          res,
          HttpStatus.BadRequest,
          MessageConstants.ID_TOKEN_REQUIRED
        );
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      const userData: IGoogleUserData = {
        uid: decodedToken.uid,
        email: decodedToken.email!,
        email_verified: decodedToken.email_verified!,
        name: decodedToken.name || "Unknown",
      };

      const { user, accessToken, refreshToken } =
        await this._userService.googleSignIn(userData);
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });
      const responseData = {
        user: { id: user._id, name: user.name, email: user.email },
        accessToken,
        refreshToken,
      };
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.GOOGLE_SIGNIN_SUCCESS,
        responseData
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.GOOGLE_SIGNIN_FAILED
      );
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log("refreshToken :", refreshToken);

      if (!refreshToken) {
        console.warn("No refresh token found in cookies");
        res.status(400).json({ message: "Refresh token is required" });
        return;
      }

      const tokens = await this._userService.refreshAccessToken(refreshToken);
      console.log("tokens : ", tokens);

      if (!tokens || !tokens.accessToken) {
        console.warn("Invalid refresh token or no tokens returned");
        res
          .status(400)
          .json({ message: "Invalid refresh token or no tokens returned" });
        return;
      }

      // Set the new access token in cookies
      console.log("Setting new access token in cookies");
      res.cookie(
        "accessToken",
        tokens.accessToken,
        CookieManager.getCookieOptions()
      );

      res.status(200).json({
        tokens: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error: any) {
      console.error("Failed to refresh tokens:", error.message);
      res
        .status(500)
        .json({ message: "Failed to refresh tokens", error: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      console.log("forgetemail", email);
      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
      }
      const response = await this._userService.forgotPasswordVerify(email);
      if (response.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error: any) {
      console.error("Error in forgotPassword controller:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Log the received request body
      console.log("Received request body:", req.body);

      if (!email || !password) {
        console.log("Missing email or newPassword in request body");
        res.status(400).json({
          success: false,
          message: "Email and new password are required",
        });
        return;
      }

      console.log(`Attempting to reset password for email: ${email}`);

      const response = await this._userService.resetPassword(email, password);

      // Log the response from the userService
      console.log("Response from userService.resetPassword:", response);

      if (response.success) {
        console.log(`Password successfully updated for email: ${email}`);
        res
          .status(200)
          .json({ success: true, message: "Password successfully updated" });
      } else {
        console.log(
          `Failed to update password for email: ${email}. Reason:`,
          response
        );
        res.status(400).json(response);
      }
    } catch (error: any) {
      console.error(
        "Error in resetPassword controller:",
        error.message,
        error.stack
      );
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
      // res
      //   .status(500)
      //   .json({ success: false, message: "Internal server error" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        // sameSite: 'none',
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        //  sameSite: 'none',
      });
      sendResponse(
        res,
        HttpStatus.Created,
        MessageConstants.SIGNEDOUT_SUCCESS,
      );

      // res
      //   .status(200)
      //   .json({ success: true, message: "Signed Out Successfully" });
    } catch (error: any) {
      console.error(error.message);
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );

      // res
      //   .status(500)
      //   .json({ success: false, message: "Internal server error" });
    }
  }

  // Profile session
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.USER_ID_NOT_FOUND
        );
      }
      const userProfile = await this._userService.getUserProfile(userId);
      if (!userProfile) {
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.USER_NOT_FOUND
        );
      }
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.PROFILE_FETCHED_SUCCESS,
        userProfile
      );
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.USER_ID_NOT_FOUND
        );
      }
      if (!req.file?.path) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.FILE_NOT_UPLOADED
        );
      }
      const profilePicture = await this._userService.uploadProfilePicture(
        userId,
        req.file.path
      );
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.PROFILE_PICTURE_UPLOADED,
        { profilePicture }
      );
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.USER_ID_NOT_FOUND
        );
      }

      // Use mobile_no instead of mobile
      const { name, email, mobile_no, address, DOB, age, gender } = req.body;
      console.log("Received update data:", req.body);

      const updatedUser = await this._userService.updateUserProfile(userId, {
        name,
        email,
        mobile_no, // Changed from mobile to mobile_no
        address,
        DOB,
        age,
        gender,
      });

      if (!updatedUser) {
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.USER_NOT_FOUND
        );
      }

      // Verify address in the response
      console.log("Updated user with address:", updatedUser.address);
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.PROFILE_UPDATED_SUCCESS,
        updatedUser
      );
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  // Doctors fetching
  async getAllDoctors(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._userService.getAllDoctors();
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.DOCTOR_FETCH_SUCCESSFULL,
        result.doctors
      );
      console.log("result : ", result);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }

  async fetchDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      console.log("doctorId ", doctorId);

      // Find doctor by ID
      const doctor = await this._userService.getDoctorById(doctorId);
      console.log(doctor);

      if (!doctor) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.DOCTOR_NOT_FOUND);
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.DOCTOR_FETCHED_SUCCESSFULLY, doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      sendError(
        res,
        HttpStatus.BadRequest,
        MessageConstants.INTERNAL_SERVER_ERROR
      );

      // res
      //   .status(HttpStatus.InternalServerError)
      //   .json({ message: "Internal server error" });
    }
  }
}
