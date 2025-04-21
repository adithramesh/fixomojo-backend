import mongoose, {Schema, Document} from 'mongoose'

export enum Role{
    USER = "user",
    PARTNER = "partner",
    ADMIN = "admin",
}

export interface IUser extends Document {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Role;
  serviceType?: string;
  adminCode?: string;
  department?: string;
  aadharVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema:Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum:Object.values(Role), default:Role.USER },
        serviceType: { type: String },
        adminCode: { type: String },
        department: { type: String },
        aadharVerified: { type: Boolean, default: false },
        phoneVerified: { type: Boolean, default: false },
      },
      { timestamps: true } 
)

export default mongoose.model<IUser>('User',userSchema)