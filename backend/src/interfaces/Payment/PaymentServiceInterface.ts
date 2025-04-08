export interface IPaymentService {
    createOrder(amount: number, currency: string): Promise<any>;
    verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean>;
}