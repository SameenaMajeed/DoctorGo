import { INotificationRepository } from "../../interfaces/Notification/INotificationRepositoryInterface";
import {
  INotification,
  Notification,
} from "../../models/commonModel/NotificationModel";

export class NotificationRepository implements INotificationRepository {
  async createNotification(data: {
    recipientId: string;
    recipientType: "user" | "doctor";
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<INotification> {
    return await Notification.create(data);
  }

  async findByRecipient(
    recipientId: string,
    recipientType: string
  ): Promise<INotification[]> {
    return Notification.find({ recipientId, recipientType }).sort({
      createdAt: -1,
    });
  }

  // Add other notification-related methods as needed
  async getUnreadCount(recipientId: string): Promise<number> {
    return await Notification.countDocuments({
      recipientId,
      read: false,
    });
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { $set: { read: true } },
      { new: true }
    );
  }

  async markAllAsRead(
    recipientId: string,
    recipientType: string
  ): Promise<void> {
    await Notification.updateMany(
      { recipientId, recipientType, read: false },
      { $set: { read: true } }
    );
  }

  async clearAllNotifications(
    recipientId: string,
    recipientType: string
  ): Promise<void> {
    await Notification.deleteMany({ recipientId, recipientType });
  }

  async deleteNotificationById(notificationId: string): Promise<void> {
    await Notification.findByIdAndDelete(notificationId);
  }
}
