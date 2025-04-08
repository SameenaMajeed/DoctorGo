// export interface RazorpayOptions {
//   key: string;
//   amount: number;
//   currency: string;
//   order_id: string;
//   name: string;
//   description: string;
//   image?: string;
//   handler: (response: RazorpayResponse) => void;
//   modal: {
//     ondismiss: () => void;
//   };
//   prefill: {
//     name: string;
//     email: string;
//     contact: string;
//   };
//   theme: {
//     color: string;
//   };
// }

// export interface RazorpayResponse {
//   razorpay_payment_id: string;
//   razorpay_order_id: string;
//   razorpay_signature: string;
// }

// export interface RazorpayErrorResponse {
//   error: {
//     code: string;
//     description: string;
//     source: string;
//     step: string;
//     reason: string;
//     metadata: {
//       payment_id: string;
//       order_id: string;
//     };
//   };
// }

// export enum AppointmentStatus {
//   PENDING = "pending",
//   CONFIRMED = "confirmed",
//   PAYMENT_FAILED = "payment_failed",
//   CANCELLED = "cancelled",
//   PAYMENT_PENDING = "payment_pending",
//   EXPIRED = "expired",
//   COMPLETED = "completed",
// }


// export interface DoctorType {
//     _id: string;
//     name: string;
//     price: number;
//     specialization : string;
//     description?: string;  
// }


// export interface Booking  {
//     _id: string;
//     userId: string;
//     // user: {
//     //   name: string;
//     //   email: string;
//     //   phone: string;
//     // };
//     doctor:  { _id: string; name: string };;
//     appointmentDate: string;
//     timeSlot: string;
//     modeOfAppointment: "online" | "offline";
//     status: AppointmentStatus;
//     paymentId?: string;
//     paymentMethod?: "razorpay"; // | "wallet";
//     ticketPrice: number;
//     cancellationReason?: string;
//     rescheduledDate?: string;
//     doctorNotes?: string;
//     createdAt: string;
//     updatedAt: string;
//   }


//   export interface PaymentResponse {
//     status: number;
//     success: boolean;
//     message: string;
//     data: {
//       amount: number;
//       currency: string;
//       id: string;
//       amount_due?: number;
//       amount_paid?: number;
//       attempts?: number;
//       created_at?: number;
//       entity?: string;
//       notes?: any[];
//       offer_id?: string | null;
//       receipt?: string;
//       status?: string;
//     };
//   }

//   export interface BookingResponse {
//     status: number;
//     message: string;
//     data: Booking;
//     success: boolean;
//   }

//   export interface AvailableTablesResponse {
//     status: number;
//     message: string;
//     data: TableType[];
//     success: boolean;
//   }


//   export interface Booking {
//     _id: string;
//     userId?: User | null;
//     tableType: Do | null;
//     reservationDate: string;
//     timeSlot: string;
//     partySize: number;
//     status: "pending" | "confirmed" | "completed" | "cancelled";
//     specialRequests?: string;
//   }
