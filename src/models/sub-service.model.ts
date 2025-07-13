import mongoose, { Schema, Document } from 'mongoose';

export interface ISubService extends Document {
  serviceName: string;
  subServiceName: string;
  serviceId: mongoose.Types.ObjectId;
  image?: string;
  description?: string;
  status: 'active' | 'blocked' | 'suspended' | 'deleted';
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const subServiceSchema: Schema = new Schema(
  {
    serviceName: { type: String, required: true },
    subServiceName: { type: String, required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    image: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended', 'deleted'],
      default: 'active'
    },
    price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<ISubService>('SubService', subServiceSchema);