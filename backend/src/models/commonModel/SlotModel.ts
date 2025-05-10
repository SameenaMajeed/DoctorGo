import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for the recurring object
interface IRecurring {
  isRecurring: boolean;
  frequency?: "daily" | "weekly" | "monthly";
  endDate?: Date;
}

// Define the Slot interface extending Document
export interface ISlot extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
  isBlocked: boolean;
  maxPatients: number;
  bookedCount: number;
  recurring?: IRecurring; // Matches the optional nature in the schema
  // notes?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
  patientId?: mongoose.Types.ObjectId;
}

// Define the schema with ISlot type
const SlotSchema: Schema<ISlot> = new Schema<ISlot>({
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  maxPatients: { type: Number, required: true, min: 1, default: 1 },
  bookedCount: { type: Number, default: 0, min: 0 },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
    endDate: { type: Date },
  },
  isBlocked: { type: Boolean, default: false },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
  // notes: { type: String },
  lastModifiedBy: { type: String },
  lastModifiedAt: { type: Date },
});

// Add validation middleware
SlotSchema.pre("save", function (next) {
  // Update lastModifiedAt
  this.lastModifiedAt = new Date();

  // Validate bookedCount doesn't exceed maxPatients
  if (this.bookedCount > this.maxPatients) {
    next(new Error("Booked count cannot exceed maximum patients"));
    return;
  }

  // Update isBooked based on bookedCount
  this.isBooked = this.bookedCount >= this.maxPatients;

  next();
});

// Create and export the model
const Slot: Model<ISlot> = mongoose.model<ISlot>("Slot", SlotSchema);
export default Slot;
