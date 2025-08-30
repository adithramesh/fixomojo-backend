import { ClientSession, FilterQuery } from "mongoose";
import { IBooking } from "../../models/booking.model";

export interface IBookingRepository {
    createBooking(data:Partial<IBooking>):Promise<IBooking>
    updateBooking(id:string, updateData:Partial<IBooking>): Promise<IBooking | null>
    findOneBooking(data:object):Promise<IBooking | null>
    getAllBookings(skip: number,limit: number,sortBy: string,sortOrder: string,filter:Record<string, unknown>):Promise<IBooking[]>
    findBookingsWithStatus( data:object):Promise<IBooking[]>
    findBookingsPaginated(skip: number,limit: number,sortBy: string,sortOrder: string,filter:FilterQuery<IBooking>):Promise<IBooking[]>
    findBookingById(id:string):Promise<IBooking | null>
    findBookingByIdAndUpdateStatus(bookingId: string, expectedStatus: string, newStatus: string, session?: ClientSession):Promise<IBooking | null>
    countBookings(filter: Record<string, unknown>):Promise<number>
    getBookingStatusDistribution():Promise<{status:string;count:number}[]>
    getRevenueTrends():Promise<{week:number;totalRevenue:number}[]>
}