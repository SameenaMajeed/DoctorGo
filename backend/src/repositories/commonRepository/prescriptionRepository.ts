import mongoose, { Types } from "mongoose";
import IPrescriptionRepository from "../../interfaces/prescription/IPrescriptionRepository";
import PrescriptionModel, {
  IPrescription,
} from "../../models/commonModel/prescriptionmodel";
import { BaseRepository } from "../commonRepository/BaseRepository";

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
      .populate("doctorId")
      .populate("userId")
      .exec();
  }


  async findPrescriptions(
    doctorId: string,
    userId: string,
    date: string | undefined,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ""
  ): Promise<{ prescriptions: IPrescription[]; total: number }> {
    const filter: any = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      filter.doctorId = doctorId;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const [prescriptions, total] = await Promise.all([
      PrescriptionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PrescriptionModel.countDocuments(filter),
    ]);

    return { prescriptions, total };
  }


  // userside:
  // Fetch all prescriptions for a user
  async getPrescriptionsByUserId(
    userId: Types.ObjectId
  ): Promise<IPrescription[]> {
    return PrescriptionModel.find({ userId })
      .populate("doctorId", "name") // Populate doctor name
      .lean(); // Convert to plain JavaScript objects
  }

  // Fetch a single prescription by ID
  async getPrescriptionById(
    prescriptionId: Types.ObjectId
  ): Promise<IPrescription | null> {
    return await this.model
      .findById(prescriptionId)
      .populate("userId", "name email age gender address mobile_no DOB address")
      .populate(
        "doctorId",
        "name email phone qualification specialization registrationNumber "
      )
      .exec();
  }
  async findByAppointmentId(
    appointmentId: string
  ): Promise<IPrescription | null> {
    return PrescriptionModel.findOne({ appointmentId })
      .populate("userId", "name email age gender address mobile_no DOB address")
      .populate(
        "doctorId",
        "name email phone qualification specialization registrationNumber "
      )
      .exec();
  }
}
