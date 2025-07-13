import { ClientSession } from "mongoose";
import { IBooking } from "../../models/booking.model";

export interface IBookingRepository {
    createBooking(data:Partial<IBooking>):Promise<IBooking>
    updateBooking(id:string, updateData:Partial<IBooking>): Promise<IBooking | null>
    getAllBookings(skip: number,limit: number,sortBy: string,sortOrder: string,filter:Record<string, unknown>):Promise<IBooking[]>
    findBookingById(id:string):Promise<IBooking | null>
    findBookingByIdAndUpdateStatus(bookingId: string, expectedStatus: string, newStatus: string, session?: ClientSession):Promise<IBooking | null>
    countBookings(filter: Record<string, unknown>):Promise<number>
}