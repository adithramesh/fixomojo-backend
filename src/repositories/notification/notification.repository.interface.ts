import { FilterQuery } from 'mongoose';
import { INotification } from '../../models/notification.model'; // Assuming this path

export interface INotificationRepository {
  // Inherited from BaseRepository:
  create(data: Partial<INotification>): Promise<INotification>;
  findById(id: string): Promise<INotification | null>;
  findOne(filter: FilterQuery<INotification>): Promise<INotification | null>;
  find(filter: FilterQuery<INotification>): Promise<INotification[]>;
  update(id: string, data: Partial<INotification>): Promise<INotification | null>;
  delete(id: string): Promise<boolean>;
  count(filter: FilterQuery<INotification>): Promise<number>;

  // Notification-specific methods:
  findByRecipientId(
    recipientId: string,
    filter?: FilterQuery<INotification>,
    limit?: number,
    skip?: number
  ): Promise<INotification[]>;
  getUnreadCount(recipientId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(recipientId: string): Promise<number>; // Returns count of modified docs
}