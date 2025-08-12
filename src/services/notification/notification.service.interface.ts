import { PaginatedResponseDTO, PaginationRequestDTO } from "../../dto/admin.dto";
import { INotification, NotificationType } from "../../models/notification.model";
import mongoose from "mongoose"; // Import mongoose for ObjectId type

export interface INotificationService {

  createNotification(
    recipientId: string,
    recipientRole: string|undefined, // Use your Role enum here if possible (Role.USER etc.)
    type: NotificationType,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any, // Using any for simplicity as discussed, matches schema
    senderId?: mongoose.Types.ObjectId,
    senderRole?: string // Use your Role enum here if possible
  ): Promise<INotification>;
  getNotifications(
    pagination: PaginationRequestDTO,
    userId: string
  ): Promise<PaginatedResponseDTO<INotification[]>>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
}