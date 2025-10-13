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
    async countBookings(filter: Record<string, unknown> = {},startDate?: string, endDate?: string) {
      const query: Record<string, unknown> = { ...filter };
        // const totalBookings=await this.find(filter);
        // const count=totalBookings.length
        // console.log("length", count);
        // return count
        if (startDate && endDate) {
              query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              };
        }

        return await Booking.countDocuments(query);
    }

    async findBookingByIdAndUpdateStatus(bookingId: string, expectedStatus: string, newStatus: string, session?: mongoose.ClientSession): Promise<IBooking | null> {
        return Booking.findOneAndUpdate(
            { _id: bookingId, bookingStatus: expectedStatus },
            { $set: { bookingStatus: newStatus } },
            { session, new: true }
        );
    }

    async getBookingStatusDistribution(startDate?: string, endDate?: string): Promise<{ status: string; count: number }[]>{
      // return await Booking.aggregate([{$group:{_id:`$bookingStatus`,count:{$sum:1}}},{$project:{_id:0,status:'$_id',count:'$count'}}])
       const matchStage: Record<string, unknown> = {};
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      return await Booking.aggregate([
        { $match: matchStage },
        { $group: { _id: `$bookingStatus`, count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: '$count' } }
      ]);
    }

    // async getRevenueTrends(): Promise<{ week: number; totalRevenue: number; }[]>{
    //   const eightWeeksAgo = new Date();
    //   eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56); // 8 weeks * 7 days
    //   return await Booking.aggregate([{$match:{bookingStatus:'Completed',createdAt:{$gte:eightWeeksAgo}}},{$group:{_id:{$isoWeek:'$createdAt'}, totalRevenue:{ $sum: { $multiply: ['$totalAmount', 0.2] } }}},{$sort:{_id:1}},{$project:{_id:0,week:"$_id", totalRevenue:'$totalRevenue'}}])
    // }

    async getRevenueTrends(startDate?: string, endDate?: string): Promise<{ week: number; totalRevenue: number }[]> {
      const matchStage: Record<string, unknown> = { bookingStatus: 'Completed' };

      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      } else {
        // default = last 8 weeks
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        matchStage.createdAt = { $gte: eightWeeksAgo };
      }

      return await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $isoWeek: '$createdAt' },
            totalRevenue: { $sum: { $multiply: ['$totalAmount', 0.2] } }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, week: '$_id', totalRevenue: '$totalRevenue' } }
      ]);
        }
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async gateSalesreportData(filters:{startDate:Date, endDate:Date, paymentStatus:string}):Promise<any[]> {
    return await Booking.find({createdAt:{$gte:filters.startDate, $lte:filters.endDate }, paymentSuccess:filters.paymentStatus})
    .select('_id createdAt username subServiceName totalAmount paymentMethod bookingStatus paymentStatus timeSlotStart')
    .sort({createdAt:-1})
    .lean()
  }

  async countBookingsByUserId(userId: string, filter: Record<string, unknown> = {}) {
      const query = {
        userId:userId,
        ...filter
      };

      console.log("query", query);
      
      return await Booking.countDocuments(query)
    }

  async calculateTotalRevenue(startDate?: string, endDate?: string): Promise<number> {
    const matchStage: Record<string, unknown> = { bookingStatus: 'Completed' };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    console.log("matchStage",matchStage);
    
    const result = await Booking.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: { $multiply: ['$totalAmount', 0.2] } } } }
    ]);
    console.log("result",result);
    return result.length ? result[0].total : 0;
  }


}