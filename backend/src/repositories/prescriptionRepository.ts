import IPrescriptionRepository from "../interfaces/prescription/IPrescriptionRepository";
import PrescriptionModel, { IPrescription } from "../models/prescriptionmodel";
import { BaseRepository } from "./BaseRepository";

export default class prescriptionRepository
  extends BaseRepository<IPrescription>
  implements IPrescriptionRepository
{
  constructor() {
    super(PrescriptionModel);
  }

  async createPrescription(
    prescription: IPrescription
  ): Promise<IPrescription> {
    return this.create(prescription);
  }

  async getById(id: string): Promise<IPrescription | null> {
    return await PrescriptionModel.findById(id)
      .populate('doctorId')
      .populate('userId')
      .exec(); 
  }
  
}
