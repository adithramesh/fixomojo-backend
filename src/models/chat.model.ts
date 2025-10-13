import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  messageText: string;
  senderType: 'user' | 'technician';
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema: Schema<IChat> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    messageText: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'technician'],
      required: true,
    },
  },
  { timestamps: true }
);

// Add index for faster queries by bookingId
chatSchema.index({ bookingId: 1 });

export default mongoose.model<IChat>('Chat', chatSchema);