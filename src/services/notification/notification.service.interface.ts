import { PaginatedResponseDTO, PaginationRequestDTO } from "../../dto/admin.dto";
import { INotification, NotificationType } from "../../models/notification.model";
import mongoose from "mongoose"; // Import mongoose for ObjectId type

export interface INotificationService {

  createNotification(
    recipientId: string,
    recipientRole: string|undefined, 
    type: NotificationType,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    senderId?: mongoose.Types.ObjectId,
    senderRole?: string 
  ): Promise<INotification>;
  getNotifications(
    pagination: PaginationRequestDTO,
    userId: string
  ): Promise<PaginatedResponseDTO<INotification[]>>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string, actionTaken?: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
}