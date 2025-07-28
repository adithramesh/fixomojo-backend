import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';
import { IChatService } from './chat.service.interface';
import { TYPES } from '../../types/types';
import { IBookingRepository } from '../../repositories/booking/booking.repository.interface';
import { IChat } from '../../models/chat.model';
import { IChatRepository } from '../../repositories/chat/chat.repository.interface';
import { Role } from '../../models/user.model';


@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(TYPES.IChatRepository) private _chatRepository: IChatRepository,
     @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
  ) {}

  async getChatHistory(bookingId: string, userId: string, role: string): Promise<IChat[]> {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new Error('Invalid booking ID');
    }

    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const isUser = role === Role.USER;
    const isPartner = role === Role.PARTNER;
    if (
      (isUser && booking.userId.toString() !== userId) ||
      (isPartner && booking.technicianId.toString() !== userId)
    ) {
      throw new Error('Unauthorized access to chat');
    }

    return this._chatRepository.findByBookingId(bookingId);
  }

  async getActiveChats(userId: string): Promise<string[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    return this._chatRepository.findActiveChats(userId);
  }

  async sendMessage(bookingId: string, messageText: string, senderId: string, senderRole: string): Promise<IChat> {
    if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      throw new Error('Invalid booking or user ID');
    }

    if (!messageText.trim()) {
      throw new Error('Message text cannot be empty');
    }

    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const isUser = senderRole === Role.USER;
    const isPartner = senderRole === Role.PARTNER;
    if (
      (isUser && booking.userId.toString() !== senderId) ||
      (isPartner && booking.technicianId.toString() !== senderId)
    ) {
      throw new Error('Unauthorized to send message');
    }

    const chatData: Partial<IChat> = {
      userId: new mongoose.Types.ObjectId(booking.userId),
      technicianId: new mongoose.Types.ObjectId(booking.technicianId),
      bookingId: new mongoose.Types.ObjectId(bookingId),
      messageText,
      senderType: isUser ? 'user' : 'technician',
    };

    return this._chatRepository.create(chatData);
  }
}