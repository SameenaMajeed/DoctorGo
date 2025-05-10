import { Request, Response } from "express";
import { MessageConstants } from "../../constants/MessageConstants";
import { IPrescriptionService } from "../../interfaces/prescription/PrescriptionServiceInterface";
import { sendError, sendResponse } from "../../utils/responseUtils";
import { HttpStatus } from "../../constants/Httpstatus";
import { AppError } from "../../utils/AppError";
import fs from "fs";

export default class PrescriptionController {
  constructor(private prescriptionService: IPrescriptionService) {}

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

      const prescription = await this.prescriptionService.createPrescription(
        data
      );

      sendResponse(
        res,
        HttpStatus.Created,
        MessageConstants.PRESCRIPTION_CREATED,
        { prescription }
      );
    } catch (error: any) {
      sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
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
        return sendError(res, HttpStatus.BadRequest, "Doctor ID is required");
      }
      if (!userId) {
        return sendError(res, HttpStatus.BadRequest, "User ID is required");
      }

      const { prescriptions, total } =
        await this.prescriptionService.getPrescriptions(
          doctorId,
          userId,
          date as string | undefined,
          page,
          limit,
          searchTerm
        );

      sendResponse(res, HttpStatus.OK, "Prescriptions found successfully", {
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
          "Internal server error"
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
      const prescriptions = await this.prescriptionService.getUserPrescriptions(
        userId
      );
      res.status(200).json(prescriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
        await this.prescriptionService.getPrescriptionForDownload(
          prescriptionId,
          userId
        );

      // Verify the file exists before sending
      if (!fs.existsSync(filePath)) {
        throw new Error("PDF file not found on server");
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
      res.status(403).json({ message: error.message });
    }
  }
  // async downloadPrescription(req: Request, res: Response) {
  //   try {
  //     const { prescriptionId } = req.params;
  //     const userId = req.data?.id;
  //     if (!userId) {
  //       throw new AppError(HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
  //     }
  //     const { filePath } = await this.prescriptionService.getPrescriptionForDownload(prescriptionId, userId);

  //     res.download(filePath, `prescription_${prescriptionId}.pdf`, (err) => {
  //       if (err) {
  //         res.status(500).json({ message: "Error downloading file" });
  //       }
  //     });
  //   } catch (error: any) {
  //     res.status(403).json({ message: error.message });
  //   }
  // }

  // async getAllPrescriptions(req: Request, res: Response) {
  //   try {
  //     const query: PrescriptionQuery = {
  //       userId: req.query.userId as string,
  //       doctorId: req.query.doctorId as string,
  //       date: req.query.query as string,
  //       page: parseInt(req.query.page as string) || 1,
  //       limit: parseInt(req.query.limit as string) || 10,
  //     };

  //     // const query = req.body

  //     const prescriptions = await this.prescriptionService.getPrescriptions(query);

  //     sendResponse(
  //       res,
  //       HttpStatus.OK,
  //       'Prescriptions found successfully',
  //       { data: prescriptions }
  //     );
  //   } catch (error: any) {
  //     if (error.message === "At least one of userId or doctorId is required") {
  //       return res.status(400).json({ success: false, message: error.message });
  //     }
  //     if (error.message === "Invalid date format") {
  //       return res.status(400).json({ success: false, message: error.message });
  //     }
  //     if (error.message === "No prescriptions found") {
  //       return res.status(404).json({ success: false, message: error.message });
  //     }
  //     console.error("Error fetching prescriptions:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }
}
