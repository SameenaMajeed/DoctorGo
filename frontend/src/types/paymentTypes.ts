export enum IPaymentMethod {
  CASH = "cash",
  UPI = "upi",
  WALLET = "wallet",
}

export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PAYMENT_FAILED = "payment_failed",
  CANCELLED = "cancelled",
  PAYMENT_PENDING = "payment_pending",
  EXPIRED = "expired",
  COMPLETED = "completed",
}

export enum PaymentStatus {
  SUCCESS = "success",
  PAYMENT_FAILED = "failed",
  PENDING = "pending",
  CANCELLED = "cancelled",
  CONFIRMED = "confirmed",
}

export interface IBooking {
  _id: string;
  doctor_id?: {
    name: string;
  };
  user_id: {
    name: string;
  };
  ticketPrice: number;
  discount?: number;
  status: AppointmentStatus;
  createdAt: string;
  appointmentDate: string;
  paymentMethod?: IPaymentMethod;
  platformFee: number;
  totalAmount : number
}

export interface IPayment {
  _id: string;
  user_id: {
    name: string;
  };
  amount: number;
  status: PaymentStatus;
  paymentDate: string;
  originalStatus: AppointmentStatus;
  appointmentDate: string;
  bookingId?: string;
  paymentMethod?: IPaymentMethod;
  platformFee: number;
  createdAt?: Date;
  totalAmount : number

}
