
import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';
import { TYPES } from '../../types/types'; 
import { PaginatedResponseDTO, PaginationRequestDTO } from '../../dto/admin.dto'; 
import { INotification, NotificationType } from '../../models/notification.model'; 

import { INotificationService } from './notification.service.interface';
import { Role } from '../../models/user.model'; 
import { INotificationRepository } from '../../repositories/notification/notification.repository.interface';
import { SocketConfig } from '../../config/socket';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository,
    @inject(TYPES.SocketConfig) private _socketService: SocketConfig 
  ) {}

  async createNotification( 
    recipientId: string,
    recipientRole: string|undefined, // Cast to Role enum if you strictly control it
    type: NotificationType,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    senderId?: mongoose.Types.ObjectId,
    senderRole?: string // Cast to Role enum if strictly controlled
  ): Promise<INotification> {
    const notificationData: Partial<INotification> = {
      recipientId,
      recipientRole: recipientRole as Role, // Ensure type compatibility with Role enum
      type,
      message,
      payload: payload || {}, // Ensure payload is always an object
      senderId,
      senderRole: senderRole as Role, // Ensure type compatibility with Role enum
      read: false, // New notifications are unread by default
    };

    const newNotification = await this._notificationRepository.create(notificationData);

    // --- Socket.IO Integration ---
    // Emit the notification via Socket.IO to the specific recipient's room
    // The recipientId should be unique per user/partner/admin to map to their socket room
    this._socketService.emitToUser(newNotification.recipientId.toString(), 'newNotification', newNotification);
    // You might also emit to an admin-specific room if the notification is for admin only
    // Example: if (recipientRole === Role.ADMIN) this._socketService.emitToRoom('adminNotifications', newNotification);
    // --- End Socket.IO Integration ---

    return newNotification;
  }

  async getNotifications(
    pagination: PaginationRequestDTO,
    userId: string
  ): Promise<PaginatedResponseDTO<INotification[]>> {
    // sortBy, sortOrder,
    const { page, pageSize,      searchTerm, filter = {} } = pagination;
    const skip = (page - 1) * pageSize;

    // Apply any additional filters from the DTO, e.g., filter.read = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryFilter: any = { ...filter };
    if (searchTerm) {
      // Example: search within message text
      queryFilter.message = { $regex: searchTerm, $options: 'i' };
    }

    // Fetch the paginated notifications
    const notifications = await this._notificationRepository.findByRecipientId(
      userId,
      queryFilter,
      pageSize, // limit
      skip      // skip
    );

    // Get the total count of notifications matching the filter for this recipient
    const totalNotifications = await this._notificationRepository.count({
      ...queryFilter, // Use the same filters as the find query
      recipientId: userId,
    });

    return {
      items: notifications,
      total: totalNotifications,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(totalNotifications / pageSize),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this._notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const updated = await this._notificationRepository.markAsRead(notificationId);
    return !!updated; // Return true if a document was updated
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const modifiedCount = await this._notificationRepository.markAllAsRead(userId);
    return modifiedCount > 0; //modifiedCount/matchedCount/ acknowledged are from the result object
  }
}