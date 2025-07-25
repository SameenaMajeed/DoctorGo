import { INotification } from "../../models/commonModel/NotificationModel";

export interface INotificationServiceInterface {
  getNotifications(
    recipientId: string,
    recipientType: string
  ): Promise<INotification[]>;
  markNotificationAsRead(notificationId: string): Promise<INotification | null>;
  markAllNotificationsAsRead(
    recipientId: string,
    recipientType: string
  ): Promise<void>;
  clearAllNotifications(
    recipientId: string,
    recipientType: string
  ): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
}
