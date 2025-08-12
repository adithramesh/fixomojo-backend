
import mongoose, { Schema, Document } from 'mongoose';
import { Role } from './user.model'; 

export enum NotificationType {
  BookingConfirmed = 'booking_confirmed',
  BookingCompleted = 'booking_completed',
  NewPartnerRegistered = 'new_partner_registered',
  ChatMessage = 'chat_message',
  SystemAlert = 'system_alert',
  PaymentReceived = 'payment_received',
  BookingCancelled = 'booking_cancelled',
}

export interface INotification extends Document {
  recipientId: string;
  recipientRole?: Role; // Use your existing Role enum
  senderId?: mongoose.Types.ObjectId; // Optional, as some notifications might be system-generated
  senderRole?: Role; // Optional
  type: NotificationType;
  message: string;
  payload: { // THIS IS CRUCIAL
    bookingId?: mongoose.Types.ObjectId;
    partnerId?: mongoose.Types.ObjectId;
    chatId?: mongoose.Types.ObjectId;
    amount?: number;
    // ... any other relevant structured data (e.g., technician name, service type)
  };
  read: boolean;
}

const notificationSchema: Schema<INotification> = new Schema(
  {
    recipientId: { type: String, required: true, ref: 'User' },
    recipientRole: { type: String, enum: Object.values(Role), },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    senderRole: { type: String, enum: Object.values(Role) }, 
    type: { type: String,   enum: Object.values(NotificationType), }, 
    message: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} }, // Allows flexible data
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);