import { inject, injectable } from "inversify";
import { HomeResponseDTO } from "../../dto/home.dto";
import { IUserService } from "./user.service.interface";
import { TYPES } from "../../types/types";
import { BookServiceRequestDTO, BookServiceResponseDTO } from "../../dto/book-service.dto";
import mongoose from "mongoose";
import { getStripeUrls, stripe } from "../../config/stripe.config";
import { IBooking } from "../../models/booking.model";
import { ITransactionService } from "../transaction/transaction.service.interface";
import { IWalletService } from "../wallet/wallet.service.interface";
import { IBookingRepository } from "../../repositories/booking/booking.repository.interface";
import { ITimeSlotService } from "../time-slot/time-slot.service.interface";
import { IServiceRepository } from "../../repositories/service/service.repository.interface";
import { UserResponseDTO } from "../../dto/admin.dto";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { PartnerDashboardResponseDTO } from "../../dto/partner.dto";
import { BookingStatus } from "../../utils/booking-status.enum";
import { PaymentStatus } from "../../utils/payment-status.enum";


@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(TYPES.IServiceRepository) private _serviceRepository:IServiceRepository,
        @inject(TYPES.IBookingRepository) private _bookingRepository:IBookingRepository,
        @inject(TYPES.ITimeSlotService) private _timeSlotService:ITimeSlotService,
        @inject(TYPES.IWalletService) private _walletService:IWalletService,
        @inject(TYPES.ITransactionService) private _transactionService:ITransactionService,
        @inject(TYPES.IUserRepository) private _userRepository:IUserRepository,
    ){}

    async getHome(searchTerm:string): Promise<HomeResponseDTO> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter:any={}
   
      if (searchTerm) {
          filter.$or = [
            { serviceName: { $regex: searchTerm, $options: 'i' } },
            { 'subServices.subServiceName': { $regex: searchTerm, $options: 'i' } }
          ];
        }
      const serviceData = await this._serviceRepository.findServciesPaginated(0, 5, '', '', filter?filter:{});

      const services = serviceData.map(service => ({
        serviceId: (service._id as mongoose.Types.ObjectId).toString(),
        serviceName: service.serviceName,
        image:service.image,
  
      }));

      return {
        services
        // subServices and offers can be added later as needed
      };
    }

  async bookService(data: BookServiceRequestDTO): Promise<BookServiceResponseDTO> {
  try {

      const existingBooking = await this._bookingRepository.findOneBooking({
        technicianId: data.technicianId,
        timeSlotStart: data.timeSlotStart,
        timeSlotEnd: data.timeSlotEnd,
        bookingStatus: { $in: ['Hold', 'Confirmed'] },
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }, 
      });

      if (existingBooking) {
        return { success: false, message: 'Slot is already booked or temporarily reserved.' };
      }
    const newBooking = await this._bookingRepository.createBooking({
      ...data,
      bookingStatus: BookingStatus.HOLD,
      paymentStatus: PaymentStatus.PENDING
    });
    console.log("newBooking", newBooking);
    

    if (data.paymentMethod === 'Card') {
      const amountInCents = Math.round(data.totalAmount * 100);
      const { success, cancel } = getStripeUrls();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Fixomojo Home Service Booking',
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
           bookingId: (newBooking._id as mongoose.Types.ObjectId).toString(),
           userId: data.userId,
           subServiceId: data.subServiceId,
           technicianId: data.technicianId,
        },
        success_url: `${success}&type=card`,
        cancel_url: cancel,
      });

      return {
        success: true,
        message: 'Booking initiated. Proceed to payment.',
        data: {
          ...newBooking.toObject(),
          checkoutUrl: session.url,
          requiresCash: false,
        },
      };
    } else if(data.paymentMethod === 'Wallet') {
        return this.walletHelper(newBooking)
    } else {
      // For Cash
      return {
        message: 'Booking created successfully.',
        data: {
          ...newBooking.toObject(),
          requiresCash: true,
        },
      };
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message: `Error in bookService: ${error.message || error}`,
    };
  }
}


  async verifyPayment(sessionId: string, userId:string): Promise<{ success: boolean; message: string; bookingData?: IBooking }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.bookingId;
    if(!userId){
      return { success: false, message: 'Payment not initiated by user.' };
    }

    if (session.payment_status !== 'paid') {
      return { success: false, message: 'Payment not completed.' };
    }

      const booking = await this._bookingRepository.findBookingById(bookingId as string);
      const isReadyToProcess = booking && (booking.bookingStatus === 'Hold' || booking.bookingStatus === BookingStatus.CONFIRMED);
      const isExpired = booking && booking.createdAt < new Date(Date.now() - 5 * 60 * 1000);
      // if (!booking || booking.bookingStatus !== 'Hold' || booking.createdAt < new Date(Date.now() - 5 * 60 * 1000)) {
      if (!booking || !isReadyToProcess || isExpired) {
        //condition for second hit
        if (booking && booking.bookingStatus === BookingStatus.CONFIRMED) {
            return { success: true, message: 'Payment verified and slot already confirmed.', bookingData: booking };
        }

        if (booking) {
          await this._bookingRepository.updateBooking(bookingId as string, {
            bookingStatus: BookingStatus.CANCELLED,
            timeSlotStart: null,
            timeSlotEnd: null,
          });
        }
        return { success: false, message: 'Booking expired or invalid.' };
      }

     
      const conflictingBooking = await this._bookingRepository.findOneBooking({
        technicianId: booking.technicianId,
        timeSlotStart: booking.timeSlotStart,
        timeSlotEnd: booking.timeSlotEnd,
        bookingStatus: 'Confirmed',
        _id: { $ne: bookingId },
      });

      if (conflictingBooking) {
        await this._bookingRepository.updateBooking(bookingId as string, {
          // bookingStatus: 'Cancelled',
          bookingStatus: BookingStatus.CANCELLED,
          timeSlotStart: null,
          timeSlotEnd: null,
        });
        return { success: false, message: 'Slot already booked by another user.' };
      }

    const blockResult = await this._timeSlotService.blockSlot({
      technicianId: booking.technicianId,
      bookingId: booking._id?booking._id.toString():"",
      start: booking.timeSlotStart?.toString() || '',
      end: booking.timeSlotEnd?.toString() || '',
      reason: `Customer booking - ${booking.subServiceName}`,
      isCustomerBooking: true,

    });

    console.log("block result", blockResult);
    
    if (!blockResult.success ) {
      await this._bookingRepository.updateBooking(bookingId as string, {
        paymentStatus: PaymentStatus.SUCCESS,
        bookingStatus: BookingStatus.FAILED,
        timeSlotStart:null,
        timeSlotEnd:null
      });
      return { success: false, message: blockResult.message };
    }
    
    const updatedBooking = await this._bookingRepository.updateBooking(bookingId as string, {
      paymentStatus: PaymentStatus.SUCCESS,
      bookingStatus: BookingStatus.CONFIRMED,
    });

    if(updatedBooking){
        try {
        await this._transactionService.logTransaction({
          userId: booking.userId,
          amount: booking.totalAmount,
          transactionType: 'debit',
          purpose: "booking-payment",
          referenceId: bookingId!,
          role:"user"
        });
      } catch (logError) {
        console.error("Error logging transaction:", logError);
      }
    }
    console.log("updatedBooking", updatedBooking);
    
    return { success: true, message: 'Payment verified and slot booked.', bookingData: updatedBooking! };
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message: `Error in verifyPayment: ${error.message || error}`,
    };
  }
 }

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 async walletHelper(newBooking: any) {
  if (!newBooking || newBooking.bookingStatus !== 'Hold') {
    return { success: false, message: 'Slot already taken or booking expired.' };
  }

  
  const walletResult = await this._walletService.credit(
    newBooking.userId,
    -newBooking.totalAmount,
    'user',
    newBooking._id
  );

  if (!walletResult.success) {
 await this._bookingRepository.updateBooking(newBooking._id, {
    timeSlotStart: null,
    timeSlotEnd: null,
  });
    return {
      success: false,
      message: walletResult.message, 
    };
  }

  const blockResult = await this._timeSlotService.blockSlot({
    technicianId: newBooking.technicianId,
    bookingId: newBooking._id?.toString() || '',
    start: newBooking.timeSlotStart.toISOString(),
    end: newBooking.timeSlotEnd.toISOString(),
    reason: `Customer booking - ${newBooking.subServiceName}`,
    isCustomerBooking: true,
  });

  if (!blockResult.success) {  
    return { success: false, message: blockResult.message };
  }

  const updatedBooking = await this._bookingRepository.updateBooking(newBooking._id, {
    // paymentStatus: 'Success',
    // bookingStatus: 'Confirmed',
    paymentStatus: PaymentStatus.SUCCESS,
    bookingStatus: BookingStatus.CONFIRMED,
  });

  try {
    await this._transactionService.logTransaction({
      userId: newBooking.userId,
      amount: newBooking.totalAmount,
      transactionType: 'debit',
      purpose: 'booking-payment',
      referenceId: newBooking._id,
      role: 'user',
    });
  } catch (logError) {
    console.error('Error logging transaction:', logError);
  }

  return {
    success: true,
    message: 'Payment verified and slot booked.',
    data: {
      ...updatedBooking!.toObject(),
      requiresCash: false,
    },
  };
}

async getProfile(userId: string): Promise<Partial<UserResponseDTO>> {
  const user = await this._userRepository.findUserById(userId)
  if(!user){
    throw new Error('Invalid user ID')
  }
  const userData={
    username:user.username,
    profilePic:user.image,
    phoneNumber:user.phoneNumber
  }
  return userData
}

async updateProfile(userId:string, userData:object):Promise<Partial<UserResponseDTO>> {
    const user = await this._userRepository.findUserById(userId)
        if(!user){
          throw new Error('User not found to update'); 
        }
     const updatedUser =  await this._userRepository.updateUser(userId, userData);
     if(!updatedUser){
        throw new Error('failed to retrieve updated user'); 
     }

     return{
      image:updatedUser.image,
      username:updatedUser.username
     }
  }
  async getPartnerDashboard(userId:string): Promise<PartnerDashboardResponseDTO> {
          try {
            const totalBookings = await this._bookingRepository.countBookings({technicianId:userId});
            const completedBookings = await this._bookingRepository.countBookings({technicianId:userId,bookingStatus:'Completed'});
            const cancelledBookings = await this._bookingRepository.countBookings({technicianId:userId,bookingStatus:'Cancelled'});
            // const avgTaskPerDay = await this._userRepository.countUsers({role:'user'})
            let totalRevenue = (await this._walletService.getWallet(userId))?.wallet?.balance
            if(!totalRevenue){
              totalRevenue=0
            }
            console.log("totalRevenue, totalBookings, completedBookings, cancelledBookings", totalRevenue, totalBookings, completedBookings, cancelledBookings);
            
            return {totalRevenue, totalBookings, completedBookings, cancelledBookings}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error:any) {
            console.error("Error in saved location service:", error);
            throw error;
          }
        }
  

}