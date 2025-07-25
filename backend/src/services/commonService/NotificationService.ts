import { INotification } from "../../models/commonModel/NotificationModel";
import { INotificationRepository } from "../../interfaces/Notification/INotificationRepositoryInterface";
import { INotificationServiceInterface } from "../../interfaces/Notification/INotificationServiceInterface";

export class NotificationService implements INotificationServiceInterface {
  constructor(private _notificationRepository: INotificationRepository) {}

  async getNotifications(
    recipientId: string,
    recipientType: string
  ): Promise<INotification[]> {
    return this._notificationRepository.findByRecipient(
      recipientId,
      recipientType
    );
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<INotification | null> {
    return this._notificationRepository.markAsRead(notificationId);
  }

  async markAllNotificationsAsRead(
    recipientId: string,
    recipientType: string
  ): Promise<void> {
    await this._notificationRepository.markAllAsRead(recipientId, recipientType);
  }

  async clearAllNotifications(
    recipientId: string,
    recipientType: string
  ): Promise<void> {
    return this._notificationRepository.clearAllNotifications(
      recipientId,
      recipientType
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this._notificationRepository.deleteNotificationById(notificationId)
  }
}
