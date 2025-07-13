  import mongoose, { Schema, Document } from 'mongoose';

  export interface ITransaction extends Document {
    userId: string;
    amount: number;
    transactionType: 'credit' | 'debit';
    purpose: 'wallet-topup' | 'booking-payment' | 'commission';
    referenceId?: string;
    role: 'user' | 'partner' | 'admin';
  }

  const transactionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionType: { type: String, enum: ['credit', 'debit'], required: true },
    purpose: { type: String, enum: ['wallet-topup', 'booking-payment', 'commission'], required: true },
    referenceId: { type: String }, 
    role: { type: String, enum:['user', 'partner', 'admin'], required: true },
  },
  {timestamps:true}
  );

  export default mongoose.model<ITransaction>('Transaction', transactionSchema);