import { IBooking } from "../../models/commonModel/BookingModel";

export interface IPaymentService {
    createOrder(amount: number, currency: string): Promise<any>;
    verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean>;

    getUserPayments(
    userId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<{ payments: IBooking[]; totalPages: number }>
}