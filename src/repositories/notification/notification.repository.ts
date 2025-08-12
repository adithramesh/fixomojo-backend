import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose'; // Import FilterQuery
import { BaseRepository } from '../base.repository'; // Assuming this path
import Notification, { INotification } from '../../models/notification.model'; // Assuming this path and default export
import { INotificationRepository } from './notification.repository.interface';

@injectable()
export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {

  constructor() {
    super(Notification); 
  }

  async findByRecipientId(
    recipientId: string,
    filter: FilterQuery<INotification> = {},
    limit?: number,
    skip?: number
  ): Promise<INotification[]> {
    const query: FilterQuery<INotification> = {
      ...filter,
      recipientId: recipientId, // Ensure we filter by recipientId
    };

    let findQuery = this.model.find(query)
      .sort({ createdAt: -1 }); // Sort by newest first

    if (limit !== undefined) {
      findQuery = findQuery.limit(limit);
    }
    if (skip !== undefined) {
      findQuery = findQuery.skip(skip);
    }

    return findQuery.exec();
  }


  async getUnreadCount(recipientId: string): Promise<number> {
    return this.model.countDocuments({
      recipientId: recipientId,
      read: false,
    }).exec();
  }


  async markAsRead(notificationId: string): Promise<INotification | null> {
    return this.model.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true } 
    ).exec();
  }


  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await this.model.updateMany(
      { recipientId: recipientId, read: false },
      { read: true }
    ).exec();
    return result.modifiedCount;
  }
}