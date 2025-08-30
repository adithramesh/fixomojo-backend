import { inject, injectable } from "inversify";
import { PaginatedResponseDTO, PaginationRequestDTO } from "../../dto/admin.dto";
import { TYPES } from "../../types/types";
import { IBooking } from "../../models/booking.model";
import { IBookingService } from "./booking.service.interface";
import { IOtpService } from "../auth/otp.service";
import mongoose from "mongoose";
import config from "../../config/env";
import { ITransactionService } from "../transaction/transaction.service.interface";
import { IWalletService } from "../wallet/wallet.service.interface";
import { IBookingRepository } from "../../repositories/booking/booking.repository.interface";
import { IUserRepository } from "../../repositories/user/user.repository.interface";
import { IOtpRepository } from "../../repositories/otp/otp.repository.interface";
import { INotificationService } from "../notification/notification.service.interface";
import { NotificationType } from "../../models/notification.model";
import { Role } from "../../models/user.model";

@injectable()
export class BookingService implements IBookingService{ 
    constructor(
        @inject(TYPES.IBookingRepository) private _bookingRepository:IBookingRepository,
        @inject(TYPES.IOtpService) private _otpService:IOtpService,
        @inject(TYPES.IOtpRepository) private _otpRepository:IOtpRepository,
        @inject(TYPES.IUserRepository) private _userRepository:IUserRepository,
        @inject(TYPES.IWalletService) private _walletService:IWalletService,
        @inject(TYPES.ITransactionService) private _transactionService:ITransactionService,
        @inject(TYPES.INotificationService) private _notificationService:INotificationService
    ){}

     async getBookings(pagination: PaginationRequestDTO, userId:string, role:string): Promise<{ success: boolean; message: string; bookingList?: PaginatedResponseDTO<IBooking[]>}> {
        try {
          const { page, pageSize, sortBy, sortOrder, searchTerm, filter = {} } = pagination;
          const skip = (page - 1) * pageSize;
          if(role==='user'){
            filter.userId = userId; 
          }else{
            filter.technicianId = userId
          }
          
          if (searchTerm) {
              filter.subServiceName = { $regex: searchTerm, $options: 'i' };
          }
          const bookingList = await this._bookingRepository.findBookingsPaginated(
            skip,
            pageSize,
            sortBy || 'bookingId',
            sortOrder || 'asc',
            filter
          )
          const totalBookings = await this._bookingRepository.countBookings(filter);
           return {
              success: true, message: 'All bookings of this user sent.',
              bookingList:{
                  items: bookingList,
                  total: totalBookings,
                  page: page,
                  pageSize: pageSize,
                  totalPages: Math.ceil(totalBookings / pageSize)
              }
            };
  
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
          console.error("Error in fetching bookings in service layer:", error);
          return {
            success: false,
            message: `Error in fetching bookings in service layer: ${error.message || error}`,
          };
        }
      }

      async getBookingById(bookingId: string): Promise<{success:boolean, message:string, data?: Partial<IBooking>}> {
        try {
          const result = await this._bookingRepository.findBookingById(bookingId)
          return {
            success:true,
            message:"Found the booking correctly",
            data:result!
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
          console.error("Error in fetching booking by id in service layer:", error);
          return {
            success: false,
            message: `Error in fetching booking by id in service layer: ${error.message || error}`,
          };
        }
      }

      async getAllBookingsForAdmin(pagination: PaginationRequestDTO): Promise<{ success: boolean; message: string; bookingList?: PaginatedResponseDTO<IBooking[]>; }> {
        try {
          const { page, pageSize, sortBy, sortOrder, searchTerm, filter = {} } = pagination;
          const skip = (page - 1) * pageSize;
          
          if (searchTerm) {
              filter.subServiceName = { $regex: searchTerm, $options: 'i' };
            }
          const bookingList = await this._bookingRepository.getAllBookings(
            skip,
            pageSize,
            sortBy || 'bookingId',
            sortOrder || 'asc',
            filter
          )
          const totalBookings = await this._bookingRepository.countBookings(filter);
           return {
              success: true, message: 'All bookings of admin sent.',
              bookingList:{
                  items: bookingList,
                  total: totalBookings,
                  page: page,
                  pageSize: pageSize,
                  totalPages: Math.ceil(totalBookings / pageSize)
              }
            };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
          console.error("Error in get all bookService for admin:", error);
          return {
            success: false,
            message: `Error in get all bookService for admin: ${error.message || error}`,
          };
        }
      }
    
       
      // async countBookings():Promise<any>{
      //   try {
      //     const count = await this._bookingRepository.countBookings()
      //     console.log("count bookings in service", count);
      //     return count
      //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //   } catch (error:any) {
      //      console.error("Error in counting bookings:", error);
      //     return {
      //       success: false,
      //       message: `failed to count bookings : ${error.message || error}`,
      //     };
      //   }
      // }

      async initiateWorkComplete(technicianId:string, bookingId:string): Promise<{ success: boolean; message: string; }> {
        try {
                  const otp = this._otpService.generateOtp();
                  
                    const booking= await this._bookingRepository.findBookingById(bookingId);
                    console.log("booking", booking);
                    
                     if (!booking) {
                          return { success: false, message: "Booking not found." };
                      }
                      console.log("userId:technicianId, bookingId, otp", technicianId, bookingId, otp);
                      
                  await this._otpRepository.createOtp({ userId:technicianId, bookingId, otp });    
                  // const {phoneNumber} = await this._userRepository.findUserById(booking.userId.toString());
                  // try {
                  //     const verification = await client.verify.v2
                  //         .services("VA91f25123daf1ace8064eb1105aa93e1c")
                  //         .verifications.create({
                  //             to: phoneNumber, // Use the dynamic phone number from signUpData
                  //             channel: 'sms',
                  //             customCode: otp,
                  //         });
                  //     console.log("OTP sent, status:", verification.status,"Custom code:", otp);
                  // } catch (error) {
                  //     console.error("Error sending OTP:",error);
                  //     return { success: false, message: "Failed to send OTP", status: 500 };
                  // }
                  console.log("otp for work completion", otp);
                
                  await this._notificationService.createNotification(
                    booking.userId, 
                    Role.USER,
                    NotificationType.SystemAlert, 
                    `Your booking OTP for ${booking.subServiceName} is: ${otp}. Please provide this to the technician to complete the work.`, // Message
                    { bookingId: booking._id as string, technicianId: booking.technicianId, otp: otp } 
                  );
            
                  return {
                      success: true,
                      message: "Success in initiate bookings completion",
                  };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
           console.error("Error in initiate bookings completion:", error);
          return {
            success: false,
            message: `failed to initiate bookings completion service layer : ${error.message || error}`,
          };
        }
      }


      async verifyWorkComplete(technicianId:string, bookingId:string, otp:string): Promise<{ success: boolean; message: string; }> {
        try {
            const partner = await this._userRepository.findUserById(technicianId);
            if (!partner) {
                return { success: false, message: "Invalid partner" };
            }
            console.log("otp,",otp);
            console.log("technicianId, bookingId",technicianId, bookingId);
            

            const storedOtp = await this._otpRepository.findOtpByUserIdWithoutExpiry(technicianId);
            console.log("storedOtp", storedOtp);
            
            if (!storedOtp || storedOtp.otp !== otp || storedOtp.bookingId !== bookingId || storedOtp.userId!==technicianId) {
                return { success: false, message: "Invalid OTP or Wrong practice"};
            }

            const otpId = (storedOtp._id as mongoose.Types.ObjectId).toString();
            await this._otpRepository.deleteOtp(otpId);

            const updatedBooking = await this._bookingRepository.updateBooking(bookingId as string, {
                isCompleted: true,
                bookingStatus: 'Completed',
              });

            
                if(updatedBooking){

                    await this._notificationService.createNotification(
                      updatedBooking.userId,
                      Role.USER,
                      NotificationType.BookingCompleted,
                      `Your booking for ${updatedBooking.subServiceName} has been successfully completed and payment processed.`,
                      { bookingId: updatedBooking._id, totalAmount: updatedBooking.totalAmount }
                    );

                  console.log("updatedBooking",updatedBooking );
                  const booking = await this._bookingRepository.findBookingById(bookingId)
                  if(booking){
                    const adminShare = booking.totalAmount * 0.20;
                    const partnerShare = booking.totalAmount * 0.80;
            
                  // Update Wallets
                  await this._walletService.credit(booking.technicianId, partnerShare, 'partner', bookingId!);
                  await this._walletService.credit(config.ADMIN_ID, adminShare, 'admin', bookingId!);
                  await this._transactionService.logTransaction({userId:booking.technicianId,amount:partnerShare,transactionType:'credit',purpose:"commission",role:"partner",referenceId: bookingId!});
                  await this._transactionService.logTransaction({userId:config.ADMIN_ID,amount:adminShare,transactionType:'credit',purpose:"commission", role:"admin", referenceId: bookingId!});

                    await this._notificationService.createNotification(
                      updatedBooking.technicianId,
                      Role.PARTNER,
                      NotificationType.PaymentReceived,
                      `Booking for ${updatedBooking.subServiceName} completed. You earned ${partnerShare.toFixed(2)}`,
                      { bookingId: updatedBooking._id, earnedAmount: partnerShare }
                    );

                    
                    await this._notificationService.createNotification(
                      config.ADMIN_ID , 
                      Role.ADMIN,
                      NotificationType.BookingCompleted,
                      `Booking ${updatedBooking._id} completed. Admin commission: ${adminShare.toFixed(2)}`,
                      { bookingId: updatedBooking._id, adminCommission: adminShare }
                    );
                  }
                  

                  }

                  return { success: true, message: "OTP verified successfully"}
                }

            
          
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
         catch(error:any) {
           console.error("Error in verify work completion:", error);
          return {
            success: false,
            message: `failed to verify work completion service layer : ${error.message || error}`,
          };
        }
      }
}