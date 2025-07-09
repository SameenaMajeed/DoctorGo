import { AppointmentStatus, IBooking, IPayment, PaymentStatus } from "../types/paymentTypes";



export const mapBookingStatusToPaymentStatus = (
  bookingStatus: AppointmentStatus
): PaymentStatus => {
  switch (bookingStatus) {
    case AppointmentStatus.COMPLETED:
      return PaymentStatus.SUCCESS;
    case AppointmentStatus.FAILED:
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

export const transformBookingToPayment = (booking: IBooking): IPayment => ({
    _id: booking._id,
    user_id: booking.user_id,
    amount: booking.ticketPrice - (booking.discount || 0),
    status: mapBookingStatusToPaymentStatus(booking.status),
    paymentDate: booking.createdAt,
    originalStatus: booking.status,
    appointmentDate: booking.appointmentDate,
    bookingId: "",
    paymentMethod: booking.paymentMethod
});

export const getDisplayStatusLabel = (status: string): string =>
  status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
