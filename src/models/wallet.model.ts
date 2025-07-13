import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: string;
  role: 'user' | 'partner' | 'admin';
  balance: number;
  currency: string;
  referenceId:string
}

const walletSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'partner', 'admin'], required: true },
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'INR' },
  referenceId: { type: String, required: true, index: true },
},
{ timestamps: true } 
);

export default mongoose.model<IWallet>('Wallet', walletSchema);