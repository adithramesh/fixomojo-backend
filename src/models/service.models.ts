import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  serviceName: string;
  image:string;
  description:string;
  createdAt: Date;
  updatedAt: Date;
  status:string;
}

const serviceSchema: Schema = new Schema(
  {
    serviceName: { type: String, required: true, unique: true },
    image:{ type:String },
    description:{ type: String},
    status:{ type: String, enum: ['active', 'blocked', 'suspended', 'deleted'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", serviceSchema);
