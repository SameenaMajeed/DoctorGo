import { Request, Response } from "express";
import { MessageConstants } from "../../constants/MessageConstants";
import { IPrescriptionService } from "../../interfaces/prescription/PrescriptionServiceInterface";
import { sendError, sendResponse } from "../../utils/responseUtils";
import { HttpStatus } from "../../constants/Httpstatus";
import { AppError } from "../../utils/AppError";
import fs from "fs";

export default class PrescriptionController {
  constructor(private _prescriptionService: IPrescriptionService) {}

  async createPrescription(req: Request, res: Response) {
    try {
      const data = req.body;
      //   const userId = req.body.userId; // Assuming you have auth middleware
      const doctorId = req.data?.userId;

      // const { symptoms, disease, medicines, testReports } = req.body;

      // const prescriptionData = {
      //   userId,
      //   doctorId,
      //   symptoms,
      //   disease,
      //   medicines,
      //   testReports: testReports || [] // Handle case where no attachments
      // };

      console.log(data);

      const prescription = await this._prescriptionService.createPrescription(
        data
      );

      sendResponse(
        res,
        HttpStatus.Created,
        MessageConstants.PRESCRIPTION_CREATED,
        { prescription }
      );
    } catch (error: any) {
      sendError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllPrescriptions(req: Request, res: Response) {
    try {
      const doctorId = req.query.doctorId as string;
      console.log(doctorId);
      const userId = req.query.userId as string;
      console.log(userId);
      const { date } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = (req.query.searchTerm as string) || "";

      if (!doctorId) {
        return sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.DOCTOR_ID_REQUIRED
        );
      }
      if (!userId) {
        return sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.USER_ID_REQUIRED
        );
      }

      const { prescriptions, total } =
        await this._prescriptionService.getPrescriptions(
          doctorId,
          userId,
          date as string | undefined,
          page,
          limit,
          searchTerm
        );

      sendResponse(res, HttpStatus.OK, MessageConstants.PRESCRIPTION_FOUNTD, {
        prescriptions,
        total,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error("Error in Get Prescription:", error);
        sendError(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  // user:
  // List all prescriptions for a user
  async listPrescriptions(req: Request, res: Response) {
    try {
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.USER_ID_NOT_FOUND
        );
      }
      const prescriptions = await this._prescriptionService.getUserPrescriptions(
        userId
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.PRESCRIPTION_LISTED, {
        prescriptions,
      });
      // res.status(200).json(prescriptions);
    } catch (error: any) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  // Download a specific prescription
  async downloadPrescription(req: Request, res: Response) {
    try {
      const { prescriptionId } = req.params;
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.USER_ID_NOT_FOUND
        );
      }

      const { filePath } =
        await this._prescriptionService.getPrescriptionForDownload(
          prescriptionId,
          userId
        );

      // Verify the file exists before sending
      if (!fs.existsSync(filePath)) {
        throw new Error(MessageConstants.PDF_NOT_FOUND);
      }

      res.download(filePath, `prescription_${prescriptionId}.pdf`, (err) => {
        if (err) {
          console.error("Error sending PDF:", err);
          res.status(500).json({ message: "Error downloading file" });
        } else {
          console.log(`PDF downloaded successfully: ${filePath}`);
          // Optionally delete the file after download to save space
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting PDF file:", unlinkErr);
          });
        }
      });
    } catch (error: any) {
      console.error("Download prescription error:", error);
      sendError(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      // res.status(403).json({ message: error.message });
    }
  }

  getPrescriptionByAppointment = async (req: Request, res: Response) => {
    try {
      const { appointmentId } = req.params;
      console.log("appointmentId :", appointmentId);
      if (!appointmentId) {
        return sendError(
          res,
          HttpStatus.BadRequest,
          MessageConstants.APPOINTMENT_ID_REQUIRED
        );
      }
      const prescription =
        await this._prescriptionService.getPrescriptionByAppointment(
          appointmentId
        );

      console.log("prescription:", prescription);
      sendResponse(res, HttpStatus.OK, MessageConstants.PRESCRIPTION_FOUNTD, {
        prescription,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error("Error in Get Prescription:", error);
        sendError(
          res,
          HttpStatus.INTERNAL_SERVER_ERROR,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  };
}
