import { inject, injectable } from "inversify";
import { HomeResponseDTO } from "../../dto/home.dto";
import { IUserService } from "./user.service.interface";
import { TYPES } from "../../types/types";
import { BookServiceRequestDTO, BookServiceResponseDTO } from "../../dto/book-service.dto";
import mongoose from "mongoose";
import { stripe } from "../../config/stripe.config";
import { IBooking } from "../../models/booking.model";
import { ITransactionService } from "../transaction/transaction.service.interface";
import { IWalletService } from "../wallet/wallet.service.interface";
import { IBookingRepository } from "../../repositories/booking/booking.repository.interface";
import { ITimeSlotService } from "../time-slot/time-slot.service.interface";
import { IServiceRepository } from "../../repositories/service/service.repository.interface";


@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(TYPES.IServiceRepository) private _serviceRepository:IServiceRepository,
        @inject(TYPES.IBookingRepository) private _bookingRepository:IBookingRepository,
        @inject(TYPES.ITimeSlotService) private _timeSlotService:ITimeSlotService,
        @inject(TYPES.IWalletService) private _walletService:IWalletService,
        @inject(TYPES.ITransactionService) private _transactionService:ITransactionService
    ){}
    // async getHome(): Promise<HomeResponseDTO> {
    //    const serviceData = await this._serviceRepository.findServciesPaginated()
    //    const homeData={
    //     serviceNames:serviceData
    //    }
    //    return homeData
    // }

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
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }, // Only consider recent Holds
      });

      if (existingBooking) {
        return { success: false, message: 'Slot is already booked or temporarily reserved.' };
      }
    const newBooking = await this._bookingRepository.createBooking({
      ...data,
      bookingStatus: 'Hold', // 🟡 Initial temporary hold
      paymentStatus: 'Pending'
    });

    if (data.paymentMethod === 'Card') {
      const amountInCents = Math.round(data.totalAmount * 100);

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
        success_url: `http://localhost:4200/payment-success?session_id={CHECKOUT_SESSION_ID}&type=card`,
        cancel_url: 'http://localhost:4200/payment-cancelled',
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

    // const booking = await this._bookingRepository.findBookingById(bookingId as string);
    // if (!booking || booking.bookingStatus !== 'Hold') {
    //   return { success: false, message: 'Slot already taken or booking expired.' };
    // }

     // Check if booking is still in Hold and not expired
      const booking = await this._bookingRepository.findBookingById(bookingId as string);
      if (!booking || booking.bookingStatus !== 'Hold' || booking.createdAt < new Date(Date.now() - 5 * 60 * 1000)) {
        if (booking) {
          await this._bookingRepository.updateBooking(bookingId as string, {
            bookingStatus: 'Cancelled',
            timeSlotStart: null,
            timeSlotEnd: null,
          });
        }
        return { success: false, message: 'Booking expired or invalid.' };
      }

      // Check for conflicting Confirmed bookings
      const conflictingBooking = await this._bookingRepository.findOneBooking({
        technicianId: booking.technicianId,
        timeSlotStart: booking.timeSlotStart,
        timeSlotEnd: booking.timeSlotEnd,
        bookingStatus: 'Confirmed',
        _id: { $ne: bookingId },
      });

      if (conflictingBooking) {
        await this._bookingRepository.updateBooking(bookingId as string, {
          bookingStatus: 'Cancelled',
          timeSlotStart: null,
          timeSlotEnd: null,
        });
        return { success: false, message: 'Slot already booked by another user.' };
      }

    // Proceed to confirm and block slot
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
        paymentStatus: 'Success',
        bookingStatus: 'Failed',
        timeSlotStart:null,
        timeSlotEnd:null
      });
      return { success: false, message: blockResult.message };
    }
    
    const updatedBooking = await this._bookingRepository.updateBooking(bookingId as string, {
      paymentStatus: 'Success',
      bookingStatus: 'Confirmed',
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
        // Optionally, you can handle this error further, e.g., update booking status
      }
    }
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

  // 1. Attempt to debit wallet
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
      message: walletResult.message, // e.g., "Insufficient balance in wallet"
    };
  }

  // 2. Block the slot (only if wallet debit succeeded)
  const blockResult = await this._timeSlotService.blockSlot({
    technicianId: newBooking.technicianId,
    bookingId: newBooking._id?.toString() || '',
    start: newBooking.timeSlotStart.toISOString(),
    end: newBooking.timeSlotEnd.toISOString(),
    reason: `Customer booking - ${newBooking.subServiceName}`,
    isCustomerBooking: true,
  });

  if (!blockResult.success) {
    // Optional: Refund wallet here if needed (not mandatory)
    // await this._walletService.credit(newBooking.userId, +newBooking.totalAmount, 'user', newBooking._id);

    return { success: false, message: blockResult.message };
  }

  // 3. Confirm booking
  const updatedBooking = await this._bookingRepository.updateBooking(newBooking._id, {
    paymentStatus: 'Success',
    bookingStatus: 'Confirmed',
  });

  // 4. Log transaction
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


}