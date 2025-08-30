import mongoose from 'mongoose';
import Booking, { IBooking } from '../../models/booking.model';
import { BaseRepository } from '../base.repository';
import { IBookingRepository } from './booking.repository.interface';


export class BookingRepository extends BaseRepository<IBooking> implements IBookingRepository {
  constructor() {
    super(Booking)
  }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
      return await this.create(data)
  }

  async updateBooking(id: string, updateData: mongoose.UpdateQuery<Partial<IBooking>>): Promise<IBooking | null> {
      return await this.update(id,updateData)
  }

  async getAllBookings(skip: number,limit: number,sortBy: string,sortOrder: string,filter:Record<string, unknown> = {}): Promise<IBooking[]> {
    const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1; 
    const sortOptions: Record<string, 1 | -1> = sortBy ? { [sortBy]: sortDirection } : {}; 
      return await Booking.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .exec();
  }

  async findBookingsWithStatus(filter: object): Promise<IBooking[]> {
    return await this.find(filter)
  }

  async findBookingById(id:string):Promise<IBooking | null>{
    return await this.findById(id)
  }

  async findOneBooking(data: object): Promise<IBooking | null> {
    return await this.findOne(data)
  }

  async findBookingsPaginated(skip: number,limit: number,sortBy: string,sortOrder: string,filter:Record<string, unknown> = {}) :Promise<IBooking[]>
      {
          const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1; 
          const sortOptions: Record<string, 1 | -1> = sortBy ? { [sortBy]: sortDirection } : {}; 
          return await Booking.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .exec();
        }
    
    // async countBookings(filter: Record<string, unknown> = {}) {
    //     return await this.count(filter);
    // }
    async countBookings(filter: Record<string, unknown> = {}) {
        const totalBookings=await this.find(filter);
        const count=totalBookings.length
        console.log("length", count);
        return count
    }

    async findBookingByIdAndUpdateStatus(bookingId: string, expectedStatus: string, newStatus: string, session?: mongoose.ClientSession): Promise<IBooking | null> {
        return Booking.findOneAndUpdate(
            { _id: bookingId, bookingStatus: expectedStatus },
            { $set: { bookingStatus: newStatus } },
            { session, new: true }
        );
    }

    async getBookingStatusDistribution(): Promise<{ status: string; count: number }[]>{
      return await Booking.aggregate([{$group:{_id:`$bookingStatus`,count:{$sum:1}}},{$project:{_id:0,status:'$_id',count:'$count'}}])
    }

    async getRevenueTrends(): Promise<{ week: number; totalRevenue: number; }[]>{
      const eightWeeksAgo = new Date();
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); // 8 weeks * 7 days
      return await Booking.aggregate([{$match:{bookingStatus:'Completed',createdAt:{$gte:eightWeeksAgo}}},{$group:{_id:{$isoWeek:'$createdAt'}, totalRevenue:{ $sum: { $multiply: ['$totalAmount', 0.2] } }}},{$sort:{_id:1}},{$project:{_id:0,week:"$_id", totalRevenue:'$totalRevenue'}}])
    }

}