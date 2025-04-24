import { Request, Response } from "express";
import { MessageConstants } from "../constants/MessageConstants";
import { IPrescriptionService } from "../interfaces/prescription/PrescriptionServiceInterface";
import { sendError, sendResponse } from "../utils/responseUtils";
import { HttpStatus } from "../constants/Httpstatus";

export default class PrescriptionController {
  constructor(private prescriptionService: IPrescriptionService) {}

  async createPrescription(req: Request, res: Response) {
    console.log('hii')
    try {
      const data = req.body;
    //   const userId = req.body.userId; // Assuming you have auth middleware
    // const doctorId = req.body.doctorId; // Assuming you have auth middleware
    
    // const { symptoms, disease, medicines, testReports } = req.body;
    
    // const prescriptionData = {
    //   userId,
    //   doctorId,
    //   symptoms,
    //   disease,
    //   medicines,
    //   testReports: testReports || [] // Handle case where no attachments
    // };

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
}
