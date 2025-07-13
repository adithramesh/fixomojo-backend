import mongoose,{Schema, Document} from "mongoose"

export interface ITimeSlot extends Document{
    technicianId:string;
    date:Date;
    startTime:string;
    endTime:string;
    isBooked:boolean;
    booking?:mongoose.Types.ObjectId;
}

const timeSlotSchema:Schema = new Schema({
    technicianId:{type:String,required:true},
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: false },
},
{timestamps:true}
)

export default mongoose.model<ITimeSlot>('Timeslots',timeSlotSchema)