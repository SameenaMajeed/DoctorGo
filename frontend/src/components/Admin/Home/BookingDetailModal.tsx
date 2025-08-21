import React from "react";
import {
  Calendar,
  IndianRupee,
  Phone,
  Stethoscope,
  Users,
  XCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { IBooking } from "../../../Types";
import { AppointmentStatus } from "../../../types/paymentTypes";
import { getStatusColor } from "../../../types/StatusCode";


interface Props {
  booking: IBooking;
  onClose: () => void;
}

const BookingDetailModal: React.FC<Props> = ({ booking, onClose }) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // const formatTime = (timeString: string) =>
  //   new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-IN", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case AppointmentStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      case AppointmentStatus.CONFIRMED:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Booking Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" /> Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {booking.patientDetails.patientName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {booking.patientDetails.contactNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" /> Doctor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{booking.doctor_id.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium">
                  {booking.doctor_id.specialization}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(booking.appointmentDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{(booking.appointmentTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mode</p>
                <p className="font-medium capitalize">
                  {booking.modeOfAppointment}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {getStatusIcon(booking.status)}
                  {booking.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <IndianRupee className="w-5 h-5" /> Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ticket Price</p>
                <p className="font-medium">{formatCurrency(booking.ticketPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform Fee</p>
                <p className="font-medium">{formatCurrency(booking.platformFee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium text-lg">
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <p className="font-medium">
                  {booking.is_paid ? "Paid" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
