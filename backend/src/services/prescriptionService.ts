import IPrescriptionRepository from "../interfaces/prescription/IPrescriptionRepository";
import { IPrescription } from "../models/prescriptionmodel";

export default class PrescriptionService {
  constructor(private prescriptionRepo: IPrescriptionRepository) {}

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
    return await this.prescriptionRepo.createPrescription(prescriptionData);
  }
}
