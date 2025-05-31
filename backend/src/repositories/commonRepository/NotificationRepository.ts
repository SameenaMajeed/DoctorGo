import notificationModel, { INotification, NotificationType } from '../../models/commonModel/NotificationModel';

export class NotificationRepository {
  async create(notification: Partial<INotification>): Promise<INotification> {
    return await notificationModel.create(notification);
  }

  async findByUserId(userId: string): Promise<INotification[]> {
    return await notificationModel.find({ userId, read: false }).sort({ createdAt: -1 });
  }

  async findByDoctorId(doctorId: string): Promise<INotification[]> {
    return await notificationModel.find({ doctorId, read: false }).sort({ createdAt: -1 });
  }

  async markAsRead(id: string): Promise<void> {
    await notificationModel.findByIdAndUpdate(id, { read: true });
  }
}