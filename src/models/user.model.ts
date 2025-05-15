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
  licenseStatus: string;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  experience?:number;
  image?: string;
  about?: string;
  license?: string[];
  designation?: string;
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
        licenseStatus: { type: String,enum: ['approved', 'blocked', 'pending', 'suspended', 'deleted'], default: 'pending' },
        phoneVerified: { type: Boolean, default: false },
        experience: {type : Number},
        image: {type : String},
        license: [{type : String}],
        designation: { type: String },
        status: { type: String, enum: ['active', 'blocked', 'pending', 'suspended', 'deleted'], default: 'active' },
        about:{type: String},
      },
      { timestamps: true } 
)

export default mongoose.model<IUser>('User',userSchema)