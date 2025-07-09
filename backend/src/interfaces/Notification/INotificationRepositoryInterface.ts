import { INotification } from "../../models/commonModel/NotificationModel";

export interface INotificationRepository {
  createNotification(data: {
    recipientId: string;
    recipientType: "user" | "doctor";
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<INotification>;
  findByRecipient(
    recipientId: string,
    recipientType: string
  ): Promise<INotification[]>;
  getUnreadCount(recipientId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(recipientId: string, recipientType: string): Promise<void>
}
