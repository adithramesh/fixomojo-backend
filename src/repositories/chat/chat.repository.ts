import { injectable } from 'inversify';
// import { FilterQuery, Model } from 'mongoose';
import { IChatRepository } from './chat.repository.interface';
import Chat,{ IChat } from '../../models/chat.model';
import { BaseRepository } from '../base.repository';

@injectable()
export class ChatRepository extends BaseRepository<IChat> implements IChatRepository {
//   constructor(model: Model<IChat>) {
//     super(model);
constructor() {
    super(Chat);
  }

  async findByBookingId(bookingId: string): Promise<IChat[]> {
    return Chat
      .find({ bookingId })
      .populate('userId', 'username role')
      .populate('technicianId', 'username role')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findActiveChats(userId: string): Promise<string[]> {
    const chats = await Chat
      .find({ $or: [{ userId }, { technicianId: userId }] })
      .distinct('bookingId')
      .exec();
    return chats.map(id => id.toString());
  }
}