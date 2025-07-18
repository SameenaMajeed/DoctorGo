import { IPrescription } from "../../models/commonModel/prescriptionmodel";

export interface IPrescriptionService {
  createPrescription(prescriptionData: IPrescription): Promise<IPrescription>;

  getPrescriptions(
    doctorId: string,
    userId: string,
    date: string | undefined,
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ prescriptions: IPrescription[]; total: number }>;

  getUserPrescriptions(userId: string): Promise<IPrescription[]>;
  generatePrescriptionPDF(prescriptionId: string): Promise<string>;
  getPrescriptionForDownload(
    prescriptionId: string,
    userId: string
  ): Promise<{ prescription: IPrescription; filePath: string }>;

  getPrescriptionByAppointment(appointmentId: string): Promise<IPrescription>;
}
