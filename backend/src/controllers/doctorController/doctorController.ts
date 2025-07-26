import { Request, Response } from "express";
import { CookieManager } from "../../utils/cookieManager";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { sendResponse, sendError } from "../../utils/responseUtils";
import { CloudinaryService } from "../../utils/cloudinary.service";
import { IDoctorService } from "../../interfaces/doctor/doctorServiceInterface";
import { AppError } from "../../utils/AppError";

// Extend the Request type to include files
interface MulterRequest extends Request {
  files: Express.Multer.File[];
}

export class DoctorController {
  constructor(private doctorService: IDoctorService) {}

  async registerDoctor(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        email,
        password,
        phone,
        qualification,
        specialization,
        registrationNumber,
        certificate,
      } = req.body;
      console.log("req.body : ", req.body);

      if (!req.file) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.FILE_NOT_UPLOADED
        );
        return;
      }

      const certificatePath = await CloudinaryService.uploadFile(
        req.file.path,
        "doctor_certificates",
        `doctor_${email}`
      );

      console.log("certificatePath :", certificatePath);

      // Register doctor with certification files
      const doctor = await this.doctorService.registerDoctor({
        name,
        email,
        password,
        phone,
        qualification,
        specialization,
        registrationNumber,
        certificate: certificatePath,
        // ticketPrice,
        // extraCharge,
        // bio,
      });

      sendResponse(
        res,
        HttpStatus.Created,
        MessageConstants.DOCTOR_REGISTER_SUCCESS,
        doctor
      );
    } catch (error: any) {
      if (error.message === MessageConstants.USER_ALREADY_EXISTS) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.USER_ALREADY_EXISTS
        );
      } else if (error.message === MessageConstants.FILE_NOT_UPLOADED) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.FILE_NOT_UPLOADED
        );
      } else if (error.message.includes("Registration number already exists")) {
        sendError(
          res,
          HttpStatus.BadRequest,
          "Registration number already exists"
        );
      } else {
        sendError(res, HttpStatus.BadRequest, error.message);
      }
    }
  }

  public async loginDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.REQUIRED_FIELDS_MISSING
        );
      }

      const result = await this.doctorService.loginDoctor(email, password);
      CookieManager.setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        ...result.doctor,
        role: result.role,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      // Handle blocked account error
      if (error.message.includes("Account Blocked")) {
        const errorData = JSON.parse(error.message);
        sendError(res, HttpStatus.Forbidden, errorData.message, {
          reason: errorData.reason, // Include block reason in response
        });
      } else {
        // Forward other errors
        sendError(res, HttpStatus.InternalServerError, error.message);
      }
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.REFRESH_TOKEN_REQUIRED
        );
        return;
      }

      // Generate new access token
      const tokens = await this.doctorService.refreshAccessToken(refreshToken);
      res.cookie(
        "accessToken",
        tokens.accessToken,
        CookieManager.getCookieOptions()
      );

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.ACCESS_TOKEN_REFRESHED,
        tokens
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.REFRESH_TOKEN_FAILED,
        error.message
      );
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      const profile = await this.doctorService.getDoctorProfile(doctorId);

      if (!profile) {
        sendError(res, HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
        return;
      }

      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.PROFILE_FETCHED_SUCCESS,
        profile
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      if (!doctorId) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.DOCTOR_ID_NOT_FOUND
        );
        return;
      }

      const { name, email, phone, qualification, specialization, ticketPrice } =
        req.body;

      const updateDoctor = await this.doctorService.updatedDoctorProfile(
        doctorId,
        req.body
      );
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.PROFILE_UPDATED_SUCCESS,
        updateDoctor
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.data?.id;
      console.log(doctorId);
      if (!doctorId) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.DOCTOR_ID_NOT_FOUND
        );
        return;
      }

      if (!req.file) {
        sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.FILE_NOT_UPLOADED
        );
        return;
      }

      const profilePicture = await this.doctorService.uploadProfilePicture(
        doctorId,
        req.file.path
      );
      sendResponse(
        res,
        HttpStatus.OK,
        MessageConstants.PROFILE_PICTURE_UPLOADED,
        { profilePicture }
      );
    } catch (error: unknown) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      CookieManager.clearAuthCookies(res);
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGOUT_SUCCESS);
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async getDoctorStatus(req: Request, res: Response): Promise<void> {
    try {
      const { isOnline } = req.body;

      console.log("isOnline from body:", isOnline);
      console.log('req.params.id:',req.params.id)

      const result = await this.doctorService.toggleDoctorOnlineStatus(
        req.params.id,
        isOnline
      );

      console.log("Result from DB:", result);

      sendResponse(
        res,
        HttpStatus.OK,
        "Status Changed Successfully",
        { result }
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async uploadCertificate(req: Request, res: Response) : Promise<void> {
    try {
      if (!req.file) {
        sendError(res, HttpStatus.NotFound,"No file uploaded");
        return;
        // return res.status(400).json({ message: "No file uploaded" });
      }
      
      const doctorId = req.params.doctorId;
      const filePath = req.file?.path; 

      const certificateUrl  = await this.doctorService.uploadCertificate(doctorId, filePath);
      
      sendResponse(
        res,
        HttpStatus.OK,
        "Certificate uploaded successfully",
        { certificate: certificateUrl }
      );
    }catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async deleteCertificate(req: Request, res: Response) : Promise<void> {
    try {
      const doctorId = req.params.doctorId;
      const certificateUrl = await this.doctorService.deleteCertificate(doctorId);
      sendResponse(
        res,
        HttpStatus.OK,
        "Certificate deleted successfully",
        { certificate: certificateUrl.certificate,}
      );
      // res.json({
      //   message: "Certificate deleted successfully",
      //   data: { certificate: doctor.certificate }
      // });
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  // async fetchDoctor(req : Request ,res: Response):Promise<void>{
  //   try {
  //     const { doctorId } = req.params;

  //     // Find doctor by ID
  //     const doctor = await DoctorModel.findById(doctorId);

  //     if (!doctor) {
  //       throw new AppError(HttpStatus.NotFound, "Doctor not found");
  //     }

  //     res.status(HttpStatus.OK).json(doctor);
  //   } catch (error) {z
  //     console.error("Error fetching doctor:", error);

  //     res.status(HttpStatus.InternalServerError).json({ message: "Internal server error" });
  //   }
  // }
}
