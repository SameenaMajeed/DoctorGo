import Razorpay from "razorpay";
import crypto from "crypto";
import { IPaymentService } from "../../interfaces/Payment/PaymentServiceInterface";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { IBookingRepository } from "../../interfaces/Booking/BookingRepositoryInterface";
import { IBooking } from "../../models/commonModel/BookingModel";
import { PaymentStatus } from "../../types/PaymentType";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID!,
  key_secret: RAZORPAY_KEY_SECRET!,
});

export class PaymentService implements IPaymentService {
  constructor(private bookingRepo: IBookingRepository) {}
  async createOrder(amount: number, currency: string): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paisa (smallest currency unit)
        currency: currency,
        receipt: `Order_${Date.now()}`,
      };
      const order = await razorpayInstance.orders.create(options);
      console.log("options:", options);
      return order;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }
  // async createOrder(amount: number, currency: string): Promise<any> {
  //   try {
  //     const platformFeePercentage = 0.1; // 10% platform fee
  //     const platformFee = Math.round(amount * platformFeePercentage); // in paisa
  //     const totalAmount = Math.round(amount + platformFee)* 100 ; // doctor fee + platform fee in paisa

  //     const options = {
  //       amount: totalAmount, // Convert to paisa (smallest currency unit)
  //       currency: currency,
  //       receipt: `Order_${Date.now()}`,
  //       notes: {
  //         doctorFee: amount * 100, // in paisa
  //         platformFee: platformFee * 100,
  //       },
  //     };
  //     const order = await razorpayInstance.orders.create(options);
  //     return order;
  //   } catch (error) {
  //     console.error("Error creating Razorpay order:", error);
  //     throw new AppError(
  //       HttpStatus.InternalServerError,
  //       MessageConstants.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  async verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string
  ): Promise<boolean> {
    try {
      // Validate inputs
      if (!paymentId || !orderId || !signature) {
        throw new AppError(
          HttpStatus.BadRequest,
          "Invalid payment verification parameters"
        );
      }

      // Generate expected signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      // Compare signatures
      const isValid = generatedSignature === signature;

      if (!isValid) {
        console.error(
          `Signature mismatch: Expected ${generatedSignature}, Received ${signature}`
        );
        return false;
      }

      // Optional: Verify with Razorpay API for additional security
      try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        if (payment.order_id !== orderId || payment.status !== "captured") {
          console.error("Payment status verification failed");
          return false;
        }
      } catch (apiError) {
        console.error("Razorpay API verification error:", apiError);
      }

      return true;
    } catch (error) {
      console.error("Payment verification failed:", error);
      throw error;
    }
  }

  async getUserPayments(
    userId: string,
    page: number,
    limit: number,
    status?: PaymentStatus // Only accept valid payment statuses or undefined
  ): Promise<{ payments: IBooking[]; totalPages: number }> {
    const skip = (page - 1) * limit;

    try {
      const [payments, total] = await Promise.all([
        this.bookingRepo.findPaymentsByUser(userId, skip, limit, status),
        this.bookingRepo.countUserPayments(userId, status),
      ]);

      console.log("data", payments, total);

      return {
        payments,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      console.error("Error in get UserPayments Service:", err);
      throw err;
    }
  }
}
