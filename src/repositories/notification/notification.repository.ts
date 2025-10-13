import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from '../base.repository'; 
import Notification, { INotification } from '../../models/notification.model'; 
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
      recipientId: recipientId, 
    };

    let findQuery = this.model.find(query)
      .sort({ createdAt: -1 }); 

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


  async markAsRead(notificationId: string, actionTaken?: string): Promise<INotification | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { read: true };
        if (actionTaken && ['accepted', 'declined'].includes(actionTaken)) {
          updateFields.actionTaken = actionTaken;
        }
        return this.model.findByIdAndUpdate(
          notificationId,
          updateFields,
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