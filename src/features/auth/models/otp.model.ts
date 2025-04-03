import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  userId: mongoose.Types.ObjectId;
  otp: String;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.model<IOtp>('Otp', otpSchema);