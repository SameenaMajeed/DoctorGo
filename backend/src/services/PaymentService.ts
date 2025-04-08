import Razorpay from "razorpay";
import crypto from "crypto";
import { IPaymentService } from "../interfaces/Payment/PaymentServiceInterface";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/Httpstatus";
import { MessageConstants } from "../constants/MessageConstants";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID!,
  key_secret: RAZORPAY_KEY_SECRET!,
});

export class PaymentService implements IPaymentService {
  async createOrder(amount: number, currency: string): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paisa (smallest currency unit)
        currency: currency,
        receipt: `Order_${Date.now()}`,
      };
      const order = await razorpayInstance.orders.create(options);
      return order;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      // Validate inputs
      if (!paymentId || !orderId || !signature) {
        throw new AppError(HttpStatus.BadRequest, "Invalid payment verification parameters");
      }

      // Generate expected signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      // Compare signatures
      const isValid = generatedSignature === signature;
      
      if (!isValid) {
        console.error(`Signature mismatch: Expected ${generatedSignature}, Received ${signature}`);
        return false;
      }

      // Optional: Verify with Razorpay API for additional security
      try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        if (payment.order_id !== orderId || payment.status !== 'captured') {
          console.error('Payment status verification failed');
          return false;
        }
      } catch (apiError) {
        console.error('Razorpay API verification error:', apiError);
        
      }

      return true;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw error;
    }
}
}
