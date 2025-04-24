import { IPrescription } from "../../models/prescriptionmodel";

export interface IPrescriptionService{
    createPrescription(prescriptionData: IPrescription): Promise<IPrescription>
}