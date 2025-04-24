import { IPrescription } from "../../models/prescriptionmodel";

export default interface IPrescriptionRepository {
  createPrescription(prescription: IPrescription): Promise<IPrescription>;
  getById(id: string): Promise<IPrescription | null>
}

