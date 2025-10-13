import { IChat } from "../../models/chat.model";


export interface IChatService {
  getChatHistory(bookingId: string, userId: string, role: string): Promise<IChat[]>;
  getActiveChats(userId: string): Promise<string[]>;
  sendMessage(bookingId: string, messageText: string, senderId: string, senderRole: string): Promise<IChat>;
}