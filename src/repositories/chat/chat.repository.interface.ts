import { FilterQuery } from 'mongoose';
import { IChat } from '../../models/chat.model';


export interface IChatRepository {
  create(data: Partial<IChat>): Promise<IChat>;
  findById(id: string): Promise<IChat | null>;
  findOne(filter: FilterQuery<IChat>): Promise<IChat | null>;
  find(filter: FilterQuery<IChat>): Promise<IChat[]>;
  update(id: string, data: Partial<IChat>): Promise<IChat | null>;
  delete(id: string): Promise<boolean>;
  count(filter: FilterQuery<IChat>): Promise<number>;
  findByBookingId(bookingId: string): Promise<IChat[]>;
  findActiveChats(userId: string): Promise<string[]>;
}