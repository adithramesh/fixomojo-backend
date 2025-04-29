import mongoose, { Schema } from "mongoose";

export interface IService extends Document {
  serviceName: string;
}

const serviceSchema: Schema = new Schema(
  {
    serviceName: { type: String, required: true, unique: true },
    //other fields
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", serviceSchema);
