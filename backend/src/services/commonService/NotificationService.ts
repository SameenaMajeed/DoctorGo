import { Server } from 'socket.io';
// import { v4 as uuidv4 } from 'uuid';
import { NotificationRepository } from '../../repositories/commonRepository/NotificationRepository';
import { INotification, NotificationType } from '../../models/commonModel/NotificationModel';

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private io: Server;

  constructor(io: Server) {
    this.notificationRepository = new NotificationRepository();
    this.io = io;
  }

  async sendBookingNotification__(
    bookingId: string,
    userId: string,
    doctorId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const notification: Partial<INotification> = {
      userId,
      doctorId,
      bookingId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
    };

    const savedNotification = await this.notificationRepository.create(notification);

    // Emit to user
    this.io.to(`user_${userId}`).emit('notification', savedNotification);

    // Emit to doctor if applicable
    if (doctorId) {
      this.io.to(`doctor_${doctorId}`).emit('notification', savedNotification);
    }
  }

  async sendAppointmentReminder__(
    bookingId: string,
    userId: string,
    doctorId: string,
    hours: number
  ): Promise<void> {
    const type = hours === 24 ? NotificationType.APPOINTMENT_REMINDER_24H : NotificationType.APPOINTMENT_REMINDER_1H;
    const title = `Appointment Reminder (${hours} hours)`;
    const message = `Your appointment is scheduled in ${hours} hours.`;

    await this.sendBookingNotification__(bookingId, userId, doctorId, type, title, message);
  }

  async sendVideoCallNotification(
    bookingId: string,
    userId: string,
    doctorId: string,
    type: NotificationType,
    roomId: string
  ): Promise<void> {
    // Use Record to type the maps with NotificationType as keys
    const titleMap: Record<NotificationType, string> = {
      [NotificationType.CALL_STARTED]: 'Video Call Started',
      [NotificationType.CALL_ENDED]: 'Video Call Ended',
      [NotificationType.PATIENT_WAITING]: 'Patient is Waiting',
      [NotificationType.CALL_REMINDER]: 'Video Call Reminder',
      [NotificationType.VIDEO_CALL_STARTING]: 'Video Call Starting Soon',
      [NotificationType.BOOKING_CONFIRMED]: '', // Add all enum values to satisfy Record
      [NotificationType.BOOKING_CANCELLED]: '',
      [NotificationType.BOOKING_RESCHEDULED]: '',
      [NotificationType.PAYMENT_RECEIVED]: '',
      [NotificationType.PAYMENT_FAILED]: '',
      [NotificationType.APPOINTMENT_REMINDER_24H]: '',
      [NotificationType.APPOINTMENT_REMINDER_1H]: '',
      [NotificationType.NEW_BOOKING_REQUEST]: '',
      [NotificationType.PATIENT_IN_WAITING_ROOM]: '',
      [NotificationType.PATIENT_CANCELLED]: '',
      [NotificationType.PATIENT_RESCHEDULED_REQUEST]: '',
    };

    const messageMap: Record<NotificationType, string> = {
      [NotificationType.CALL_STARTED]: 'The video call has started.',
      [NotificationType.CALL_ENDED]: 'The video call has ended.',
      [NotificationType.PATIENT_WAITING]: 'The patient is waiting in the video call room.',
      [NotificationType.CALL_REMINDER]: 'Your video call is about to start.',
      [NotificationType.VIDEO_CALL_STARTING]: 'Your video call is starting soon.',
      [NotificationType.BOOKING_CONFIRMED]: '',
      [NotificationType.BOOKING_CANCELLED]: '',
      [NotificationType.BOOKING_RESCHEDULED]: '',
      [NotificationType.PAYMENT_RECEIVED]: '',
      [NotificationType.PAYMENT_FAILED]: '',
      [NotificationType.APPOINTMENT_REMINDER_24H]: '',
      [NotificationType.APPOINTMENT_REMINDER_1H]: '',
      [NotificationType.NEW_BOOKING_REQUEST]: '',
      [NotificationType.PATIENT_IN_WAITING_ROOM]: '',
      [NotificationType.PATIENT_CANCELLED]: '',
      [NotificationType.PATIENT_RESCHEDULED_REQUEST]: '',
    };

    // Since we're only handling video call notifications here, ensure the type is valid
    if (
      ![
        NotificationType.CALL_STARTED,
        NotificationType.CALL_ENDED,
        NotificationType.PATIENT_WAITING,
        NotificationType.CALL_REMINDER,
        NotificationType.VIDEO_CALL_STARTING,
      ].includes(type)
    ) {
      throw new Error('Invalid notification type for video call');
    }

    await this.sendBookingNotification__(
      bookingId,
      userId,
      doctorId,
      type,
      titleMap[type],
      messageMap[type],
      { roomId }
    );
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await this.notificationRepository.findByUserId(userId);
  }

  async getDoctorNotifications(doctorId: string): Promise<INotification[]> {
    return await this.notificationRepository.findByDoctorId(doctorId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId);
  }
}