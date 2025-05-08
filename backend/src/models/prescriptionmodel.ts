import mongoose, { Schema , Document} from "mongoose";

interface Medicine {
  name: string;
  dosage: string;
  quantity: number;
  time_gap: string;
}

interface TestReport {
  img: string;
}


export interface IPrescription extends Document {
  userId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medicines: Medicine[];
  symptoms: string;
  disease: string;
  testReports: TestReport[];
  vitalSigns?: string;
  createdAt: Date;
  updatedAt: Date;
  followUpDate?: Date;
}

const PrescriptionSchema : Schema = new Schema<IPrescription>(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
      },
      vitalSigns: { type: String },
      medicines: [
        {
          name: { type: String, required: true },
          dosage: { type: String, required: true },
          quantity: { type: Number, required: true },
          time_gap: { type: String, required: true },
        },
      ],
      symptoms: {
        type: String,
        required: true,
      },
      disease: {
        type: String,
        required: true,
      },
      testReports: [
        {
          img: { type: String, required: true },
        },
      ],
    },
    { timestamps: true }
  );
 
  const PrescriptionModel = mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
  export default PrescriptionModel;
