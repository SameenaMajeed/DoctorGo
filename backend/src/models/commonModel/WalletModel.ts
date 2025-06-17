import mongoose, { Document, Schema } from "mongoose";

export interface IWallet extends Document {
  user_id: mongoose.Types.ObjectId;
  balance: number;
  transactions: {
    amount: number;
    type: "credit" | "debit";
    description: string;
    booking_id?: mongoose.Types.ObjectId;
    createdAt?: Date;
  }[];
}

const WalletSchema: Schema = new Schema<IWallet>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    transactions: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ["credit", "debit"], required: true },
        description: { type: String, required: true },
        booking_id: { type: Schema.Types.ObjectId, ref: "Booking" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const WalletModel = mongoose.model<IWallet>("Wallet", WalletSchema);

export default WalletModel;
