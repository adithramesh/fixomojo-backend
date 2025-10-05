import mongoose, {Schema, Document} from "mongoose"
import { PaymentStatus } from "../utils/payment-status.enum";
import { BookingStatus } from "../utils/booking-status.enum";

export interface IBooking extends Document {
    userId:string;
    username?:string;
    subServiceId:string;
    subServiceName:string;
    location: {
        address: string;
        latitude: number;
        longitude: number;
    };
    technicianId:string;
    technicianName?:string;
    googleCalendarId?: string;  
    googleEventId?: string; 
    totalAmount:number;
    paymentMethod:"Cash" | "Card" | "Wallet";
    // bookingStatus: "Hold" |"Pending" | "Confirmed" | "Cancelled"| "Completed" | "Failed";
    // paymentStatus: "Pending" | "Success" | "Failed";
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus
    isCompleted?:boolean;
    // stripePaymentIntentId?: string
    timeSlotStart?: Date | null; 
    timeSlotEnd?: Date | null; 
    createdAt: Date;
    updatedAt: Date;
}   


const bookingSchema:Schema = new Schema({
    userId:{type:String, required:true},
    username:{type:String, required:false},
    subServiceId:{type:String, required:true},
    subServiceName:{type:String, required:true},
    location: {
        address: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    technicianId:{type:String, required:true},
    technicianName:{type:String, required:false},
    // timeSlot: { type: Schema.Types.ObjectId, ref: 'TimeSlots', required: true },
    googleCalendarId: { type:String, required: false },
    googleEventId: {type:String, required: false},
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, enum: ["Cash", "Card", "Wallet"] },
    bookingStatus: { type: String, required: true, enum: ["Hold","Pending", "Confirmed", "Cancelled", "Completed", "Failed"], default: "Pending" },
    paymentStatus: { type: String, required: true, enum: ["Pending", "Success", "Failed"], default: "Pending" },
    isCompleted:{ type: Boolean, default: false },
    timeSlotStart: { type: Date, required: false, default: null },
    timeSlotEnd: { type: Date, required: false, default: null },
    // stripePaymentIntentId: { type: String},
},
{ timestamps: true } 
)

bookingSchema.index({ technicianId: 1, timeSlotStart: 1, timeSlotEnd: 1, bookingStatus: 1 });
export default mongoose.model<IBooking>('Booking', bookingSchema)

