import { isValid } from "date-fns";
import IPrescriptionRepository from "../../interfaces/prescription/IPrescriptionRepository";
import { IPrescription } from "../../models/commonModel/prescriptionmodel";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { DoctorRepository } from "../../repositories/doctorRepository/doctorRepository";
import { UserRepository } from "../../repositories/userRepository/userRepository";
import { Types } from "mongoose";
import pdfkit from "pdfkit";
import fs from "fs";
import path from "path";

export default class PrescriptionService {
  constructor(
    private prescriptionRepo: IPrescriptionRepository,
    private doctorRepo: DoctorRepository,
    private userRepo: UserRepository
  ) {}

  async createPrescription(
    prescriptionData: IPrescription
  ): Promise<IPrescription> {
    // Check if medicines are not empty
    if (
      !prescriptionData.medicines ||
      prescriptionData.medicines.length === 0
    ) {
      throw new Error("Prescription must include at least one medicine.");
    }

    //  Check for duplicate medicine names
    const medicineNames = prescriptionData.medicines.map((m) =>
      m.name.toLowerCase()
    );
    const uniqueMedicineNames = new Set(medicineNames);
    if (uniqueMedicineNames.size !== medicineNames.length) {
      throw new Error("Duplicate medicine names found.");
    }

    // Check if testReports are valid
    for (const report of prescriptionData.testReports) {
      if (!report.img || typeof report.img !== "string") {
        throw new Error("Invalid test report image.");
      }
    }
    const result = await this.prescriptionRepo.createPrescription(prescriptionData);
    console.log('result : ' , result)
    return result
  }

  async getPrescriptions(
    doctorId: string,
    userId: string,
    date: string | undefined,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ""
  ): Promise<{ prescriptions: IPrescription[]; total: number }> {
    const doctor = await this.doctorRepo.findById(doctorId);
    console.log("doctor id:", doctor);

    if (!doctor)
      throw new AppError(
        HttpStatus.NotFound,
        MessageConstants.DOCTOR_NOT_FOUND
      );
    const user = await this.userRepo.findById(userId);
    console.log("user id:", user);

    if (!user)
      throw new AppError(
        HttpStatus.NotFound,
        MessageConstants.USER_ID_NOT_FOUND
      );

    if (date && !isValid(new Date(date))) {
      throw new Error("Invalid date format");
    }

    // Fetch prescriptions from repository
    const { prescriptions, total } =
      await this.prescriptionRepo.findPrescriptions(
        doctorId,
        userId,
        date,
        page,
        limit,
        searchTerm
      );

    return { prescriptions, total };
  }

  // user:
  // Get all prescriptions for a user
  async getUserPrescriptions(userId: string): Promise<IPrescription[]> {
    const userObjectId = new Types.ObjectId(userId);
    return this.prescriptionRepo.getPrescriptionsByUserId(userObjectId);
  }

  // Generate and save a PDF for a prescription
  async generatePrescriptionPDF(prescriptionId: string): Promise<string> {
    try {
      const prescription = await this.prescriptionRepo.getPrescriptionById(
        new Types.ObjectId(prescriptionId)
      );
      console.log("prescription:", prescription);
      if (!prescription) {
        throw new Error("Prescription not found");
      }
  
      const doc = new pdfkit({ size: "A4", margin: 50 });
      const fileName = `prescription_${prescriptionId}.pdf`;
      const filePath = path.join(__dirname, "../uploads", fileName);
      console.log(`Generating PDF at: ${filePath}`);
  
      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Created uploads directory: ${uploadsDir}`);
      }
  
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
  
      // Add Clinic Logo
      const logoPath = path.join(__dirname, "../assets/logo.png");
      const pageWidth = doc.page.width;
      const logoWidth = 100;
      const logoHeight = 50;
      const xPosition = (pageWidth - logoWidth) / 2;
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, xPosition, 30, { width: logoWidth, height: logoHeight });
        doc.moveDown(4);
      } else {
        doc.moveDown(2);
      }
  
      // Doctor Details
      const doctor = prescription.doctorId as any;
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(doctor.name || "Doctor Go", { align: "left" });
      doc.fontSize(10).font("Helvetica").text(doctor.email || "", { align: "left" });
      doc.fontSize(10).font("Helvetica").text(doctor.phone || "", { align: "left" });
      doc.fontSize(10).font("Helvetica").text(doctor.qualification || "", { align: "left" });
      doc.text(`Reg. No: ${doctor.registrationNumber || ""}`, { align: "left" });
      doc.text("Timing: 09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM", { align: "right" });
      doc.text("Closed: Sunday", { align: "right" });
      doc.moveDown(1);
      doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
  
      // Patient Details
      const patient = prescription.userId as any;
      const genderInitial =
        patient.gender?.toUpperCase() === "MALE"
          ? "M"
          : patient.gender?.toUpperCase() === "FEMALE"
          ? "F"
          : "O";
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(
          `ID: ${prescription.userId._id || prescription.userId} - ${
            patient.name || "Unknown Patient"
          } (${genderInitial}) / ${patient.age || "N/A"} Y`,
          { align: "left" }
        );
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
      doc.moveDown(0.5);
      doc.text(`Address: ${patient.address || "Unknown"}`, { align: "left" });
      doc.text(`Email: ${patient.email || "Unknown"}`, { align: "left" });
      doc.text(`Mobile Number: ${patient.mobile_no || "Unknown"}`, { align: "left" });
      doc.moveDown(1);
  
      // Chief Complaints and Diagnosis
      doc.fontSize(10).font("Helvetica-Bold").text(`CHIEF COMPLAINTS:${prescription.symptoms} `, { align: "left" });
      doc.moveDown(0.5);
      doc.fontSize(10).font("Helvetica").text("Diagnosis:");
      doc.text(`* ${prescription.disease?.toUpperCase() || "Unknown"}`);
      doc.moveDown(1);
  
      // Medicine Table
      doc.fontSize(12).font("Helvetica-Bold").text("Medicine Table", { align: "left" });
      doc.moveDown(0.5);
      doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
  
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("MEDICINE NAME", 50, doc.y, { continued: true });
      doc.text("DOSAGE", 100, doc.y, { continued: true });
      doc.text("DURATION", 200, doc.y, { continued: true });
      doc.text("Total tab", 300, doc.y,);
      doc.moveDown(0.5);
      doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
  
      prescription.medicines.forEach((med, index) => {
        doc.fontSize(10).font("Helvetica");
        doc.text(`${index + 1}) ${med.name || "Unknown"}`, 50, doc.y, { continued: true });
        doc.text(`${med.dosage || "N/A"}`, 150, doc.y, { continued: true });
        doc.text(`${med.time_gap || "N/A"}`, 250, doc.y, { continued: true });
        doc.text(`${med.quantity || "N/A"} tab`, 380, doc.y);
        doc.moveDown(0.5);
      });
      doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
  
     // Advice and Follow-up
    doc.fontSize(10).font("Helvetica");
    doc.text("Advice:");
    doc.text("* TAKE BED REST");
    doc.text("* DO NOT EAT OUTSIDE FOOD");
    doc.text("* EAT EASY TO DIGEST FOOD LIKE BOILED RICE WITH DAAL");
    doc.moveDown(0.5);
    doc.text(`Follow Up: ${new Date(prescription.followUpDate || Date.now()).toLocaleDateString()}`);
    doc.moveDown(1);
  
      // Footer
      doc.fontSize(8).font("Helvetica-Oblique").text("doctorgo@copyright", { align: "center" });
  
      doc.end();
  
      await new Promise<void>((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });
  
      console.log(`PDF generated successfully at: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }


  // Get prescription details for download
  async getPrescriptionForDownload(
    prescriptionId: string,
    userId: string
  ): Promise<{ prescription: IPrescription; filePath: string }> {
    const userObjectId = new Types.ObjectId(userId);
    const prescription = await this.prescriptionRepo.getPrescriptionById(
      new Types.ObjectId(prescriptionId)
    );

    if (!prescription) {
      throw new Error("Prescription not found");
    }

    if (!prescription.userId.equals(userObjectId)) {
      throw new Error("Unauthorized access to prescription");
    }

    const filePath = await this.generatePrescriptionPDF(prescriptionId);
    return { prescription, filePath };
  }
}
