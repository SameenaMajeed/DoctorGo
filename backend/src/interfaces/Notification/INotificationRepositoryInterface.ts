import { INotification } from "../../models/commonModel/NotificationModel";

export interface INotificationRepository {
    createNotification(data: Partial<INotification>): Promise<INotification>
    getNotificationsByUserId(userId: string): Promise<INotification[]>
    markAsRead(notificationId: string): Promise<INotification | null>
}