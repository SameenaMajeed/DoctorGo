import { Types } from "mongoose";
import { IPrescription } from "../../models/prescriptionmodel";

export default interface IPrescriptionRepository {
  createPrescription(prescription: IPrescription): Promise<IPrescription>;
  getById(id: string): Promise<IPrescription | null>;
  findById(id: string): Promise<IPrescription | null>;

  findPrescriptions(
    doctorId: string,
    userId: string,
    date: string | undefined,
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ prescriptions: IPrescription[]; total: number }>;

  // user
  getPrescriptionsByUserId(userId: Types.ObjectId): Promise<IPrescription[]>;
  getPrescriptionById(
    prescriptionId: Types.ObjectId
  ): Promise<IPrescription | null>;
}
