import cron from 'node-cron';
import { TYPES } from '../../types/types';
import container from '../../container/container';
import mongoose from 'mongoose';
import { IBookingRepository } from '../../repositories/booking/booking.repository.interface';

export const startCleanupJob = () => {
  const bookingRepository = container.get<IBookingRepository>(TYPES.IBookingRepository);
  cron.schedule('*/1 * * * *', async () => {
    try {
      console.log('Running booking cleanup job...');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const expiredBookings = await bookingRepository.findBookingsWithStatus({
        bookingStatus: 'Hold',
        timeSlotStart: { $ne: null },
        timeSlotEnd: { $ne: null },
        createdAt: { $lt: fiveMinutesAgo },
      });
      for (const booking of expiredBookings) {
        await bookingRepository.updateBooking((booking._id as mongoose.Types.ObjectId).toString(), {
          bookingStatus: 'Failed',
          timeSlotStart: null,
          timeSlotEnd: null,
        });
        console.log(`Cancelled expired booking: ${booking._id}`);
      }
      console.log('Booking cleanup job completed.');
    } catch (error) {
      console.error('Error in booking cleanup job:', error);
    }
  });
};