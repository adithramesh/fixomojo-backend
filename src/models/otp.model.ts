import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  userId: string;
  otp: string;
  bookingId?:string;
  expiresAt?: Date;
  createdAt: Date;
}

const otpSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index:true },
    otp: { type: String, required: true },
    bookingId:{type:String, required:false},
    expiresAt: { type: Date, required: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.model<IOtp>('Otp', otpSchema);