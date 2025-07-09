export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded"
}

export interface IPayment {
  _id: string;
  user_id: {
    name: string;
    // other user fields if needed
  };
  amount: number;
  status: PaymentStatus;
  paymentDate: Date;
  appointmentDate: Date;
  // other payment fields
}