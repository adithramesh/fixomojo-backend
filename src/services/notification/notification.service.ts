
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
    recipientRole: string|undefined, 
    type: NotificationType,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    senderId?: mongoose.Types.ObjectId,
    senderRole?: string 
  ): Promise<INotification> {
    const notificationData: Partial<INotification> = {
      recipientId,
      recipientRole: recipientRole as Role, 
      type,
      message,
      payload: payload || {}, 
      senderId,
      senderRole: senderRole as Role, 
      read: false, 
      actionTaken: undefined
    };

    const newNotification = await this._notificationRepository.create(notificationData);
    this._socketService.emitToUser(newNotification.recipientId.toString(), 'newNotification', newNotification);
    return newNotification;
  }

  async getNotifications(
    pagination: PaginationRequestDTO,
    userId: string
  ): Promise<PaginatedResponseDTO<INotification[]>> {
    const { page, pageSize, searchTerm, filter = {} } = pagination;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryFilter: any = { ...filter };
    if (searchTerm) {
      queryFilter.message = { $regex: searchTerm, $options: 'i' };
    }

    const notifications = await this._notificationRepository.findByRecipientId(
      userId,
      queryFilter,
      pageSize, 
      skip      
    );

    const totalNotifications = await this._notificationRepository.count({
      ...queryFilter, 
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

  async markAsRead(notificationId: string, actionTaken?: string): Promise<boolean> {
    const updated = await this._notificationRepository.markAsRead(notificationId, actionTaken);
    return !!updated; // Return true if a document was updated
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const modifiedCount = await this._notificationRepository.markAllAsRead(userId);
    return modifiedCount > 0; //modifiedCount/matchedCount/ acknowledged are from the result object
  }
}