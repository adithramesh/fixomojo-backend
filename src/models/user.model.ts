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
  rating?: number;
  image?: string;
  about?: string;
  license?: string[];
  designation?: string;
  location?: { 
        address?: string; 
        latitude: number;
        longitude: number;
    };
  googleCalendarId?: string;
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
        rating: { type: Number, min: 0, max: 5, default: 0 },
        image: {type : String},
        license: [{type : String}],
        designation: { type: String },
        status: { type: String, enum: ['active', 'blocked', 'pending', 'suspended', 'deleted'], default: 'active' },
        about:{type: String},
        location: { 
          address: { type: String }, 
          latitude: { type: Number },
          longitude: { type: Number }
        },
        googleCalendarId: { type: String, unique: true, sparse: true }
      },
      { timestamps: true } 
    
)

export default mongoose.model<IUser>('User',userSchema)