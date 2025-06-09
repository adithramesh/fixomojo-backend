import mongoose, {Schema, Document} from "mongoose"

export interface IBooking extends Document {
    userId:string;
    subServiceId:string;
    address: {
        addressLine1?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        latitude: number;
        longitude: number;
    };
    technicianId:string;
    // timeSlot: string;  
    googleCalendarId: string;  
    googleEventId: string; 
    amount:number;
    paymentMethod:"Cash" | "On  line" | "Wallet";
    bookingStatus: "Pending" | "Confirmed" | "Cancelled"| "Completed";
    paymentStatus: "Pending" | "Success" | "Failed";
    isCompleted:boolean;
    createdAt: Date;
    updatedAt: Date;
}   


const bookingSchema:Schema = new Schema({
    userId:{type:String, required:true},
    subServiceId:{type:String, required:true},
    address: {
        addressLine1: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    technicianId:{type:String, required:true},
    // timeSlot: { type: Schema.Types.ObjectId, ref: 'TimeSlots', required: true },
    googleCalendarId: { type:String, required: true },
    googleEventId: {type:String, required: true},
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, enum: ["Cash", "Online", "Wallet"] },
    bookingStatus: { type: String, required: true, enum: ["Pending", "Confirmed", "Cancelled", "Completed"], default: "Pending" },
    paymentStatus: { type: String, required: true, enum: ["Pending", "Success", "Failed"], default: "Pending" },
    isCompleted:{ type: Boolean, default: false },
},
{ timestamps: true } 
)

export default mongoose.model<IBooking>('Booking', bookingSchema)

