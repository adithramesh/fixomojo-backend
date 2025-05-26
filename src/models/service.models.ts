// import mongoose, { Schema, Document } from "mongoose";

// export interface ISubService {
//   _id?: string;
//   subServiceName: string;
//   image?: string;
//   description?: string;
//   status: 'active' | 'blocked' | 'suspended' | 'deleted';
//   price: number; 
//    createdAt?: Date; 
//   updatedAt?: Date;
// }

// export interface IService extends Document {
//   serviceName: string;
//   image:string;
//   description:string;
//   status:string;
//   subServices:ISubService[];
//   createdAt: Date;
//   updatedAt: Date; 
// }

// const serviceSchema: Schema = new Schema(
//   {
//     serviceName: { type: String, required: true, unique: true },
//     image:{ type:String },
//     description:{ type: String},
//     subServices:[
//       {
//         subServiceName:{type:String, required:true},
//         image:{ type:String},
//         description:{type:String},
//         status:{ type: String, enum: ['active', 'blocked', 'suspended', 'deleted'], default: 'active' },
//         price:{type:Number,required:true,min:0},
//         createdAt: { type: Date }, // Timestamps for sub-documents
//         updatedAt: { type: Date }
//       }
//     ],
//     status:{ type: String, enum: ['active', 'blocked', 'suspended', 'deleted'], default: 'active' },
//   },
//   { timestamps: true }
// );

// export default mongoose.model<IService>("Service", serviceSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  serviceName: string;
  image: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema: Schema = new Schema(
  {
    serviceName: { type: String, required: true, unique: true },
    image: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended', 'deleted'],
      default: 'active'
    }
  },
  { timestamps: true }
);

export default mongoose.model<IService>('Service', serviceSchema);
