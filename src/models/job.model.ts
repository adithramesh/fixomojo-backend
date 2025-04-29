import mongoose, { Schema } from "mongoose";

export interface IJob {
  designation: string;
  status: boolean;
}

const jobSchema: Schema = new Schema(
  {
    designation: { type: String, unique: true, required: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IJob>("Job", jobSchema);
