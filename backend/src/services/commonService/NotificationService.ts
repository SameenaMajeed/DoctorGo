import { INotification } from "../../models/commonModel/NotificationModel";
import { INotificationRepository } from "../../interfaces/Notification/INotificationRepositoryInterface";

export class NotificationService {
  constructor(
    private notificationRepository: INotificationRepository
  ) {}

  async getNotifications(
    recipientId: string,
    recipientType: string
  ): Promise<INotification[]> {
    return this.notificationRepository.findByRecipient(
      recipientId,
      recipientType
    );
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<INotification | null> {
    return this.notificationRepository.markAsRead(notificationId);
  }
}
