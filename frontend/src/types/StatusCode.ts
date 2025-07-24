import { AppointmentStatus, PaymentStatus } from "./paymentTypes";


export const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.COMPLETED:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case AppointmentStatus.CANCELLED:
      return "bg-red-50 text-red-700 border-red-200";
    case AppointmentStatus.CONFIRMED:
      return "bg-blue-50 text-blue-700 border-blue-200";
    case AppointmentStatus.PAYMENT_FAILED:
      return "bg-orange-50 text-orange-700 border-orange-200";
    case AppointmentStatus.PAYMENT_PENDING:
      return "bg-amber-50 text-amber-700 border-amber-200";
    case AppointmentStatus.EXPIRED:
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }
};


export const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case PaymentStatus.PAYMENT_FAILED:
      return "bg-red-50 text-red-700 border-red-200";
    case PaymentStatus.PENDING:
      return "bg-amber-50 text-amber-700 border-amber-200";
    case PaymentStatus.CANCELLED:
      return "bg-orange-50 text-orange-700 border-orange-200";
    case PaymentStatus.CONFIRMED:
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};


export const mapBookingStatusToPaymentStatus = (
  bookingStatus: AppointmentStatus
): PaymentStatus => {
  switch (bookingStatus) {
    case AppointmentStatus.COMPLETED:
      return PaymentStatus.SUCCESS;
    case AppointmentStatus.PAYMENT_FAILED:
      return PaymentStatus.PAYMENT_FAILED;
    case AppointmentStatus.PAYMENT_PENDING:
      return PaymentStatus.PENDING;
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.EXPIRED:
      return PaymentStatus.CANCELLED;
    default:
      return PaymentStatus.CONFIRMED;
  }
};
