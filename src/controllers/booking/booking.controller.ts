import { inject, injectable } from "inversify";
import { IBookingController } from "./booking.controller.interface";
import { BookingService } from "../../services/booking/booking.service";
import { TYPES } from "../../types/types";
import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { PaginationRequestDTO } from "../../dto/admin.dto";
import { HttpStatus } from "../../utils/http-status.enum";

@injectable()
export class BookingController implements IBookingController{
    constructor(
        @inject(TYPES.BookingService) private _bookingService :BookingService
    ){}

    async bookings(req: AuthRequest, res: Response): Promise<void> {
            try {
                const pagination: PaginationRequestDTO = {
                        page: parseInt(req.query.page as string) || 1,
                        pageSize: parseInt(req.query.pageSize as string) || 10,
                        sortBy: (req.query.sortBy as string) || 'bookingId',
                        sortOrder: (req.query.sortOrder as string) || 'asc',
                        searchTerm: req.query.searchTerm as string || '',
                        filter:  {},
                     
                      };
                const userId=req.user?.id.toString() || ''
                const role = req.user?.role
                console.log("userId through token", userId);
                
                const result = await this._bookingService.getBookings(pagination, userId, role!); // Call with userId
                console.log("bookingList", result.bookingList);
                
            if (result.success) {
                res.status(HttpStatus.SUCCESS).json({ success: true, bookingList: result.bookingList });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error:any) {
                console.error("Error in fetch booking controller:", error);
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to get users booking list" });
            }
        }

        async getBookingById(req: Request, res: Response): Promise<void> {
            try {
                const bookingId = req.params.bookingId 
                const response = await this._bookingService.getBookingById(bookingId)
                res.status(HttpStatus.SUCCESS).json(response)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error:any) {
                console.error("Error in get booking by id controller:", error);
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to get booking list for admin" });
            }
        }

        async getAllBookingsForAdmin(req: AuthRequest, res: Response): Promise<void> {
            try {
                  const pagination: PaginationRequestDTO = {
                        page: parseInt(req.query.page as string) || 1,
                        pageSize: parseInt(req.query.pageSize as string) || 10,
                        sortBy: (req.query.sortBy as string) || 'bookingId',
                        sortOrder: (req.query.sortOrder as string) || 'asc',
                        searchTerm: req.query.searchTerm as string || '',
                        filter:  {},
                     
                      };
                const role = req.user?.role
                if(role!=='admin'){
                    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Failed to get booking list for admin" });
                }

                const result = await this._bookingService.getAllBookingsForAdmin(pagination)
                if (result.success) {
                res.status(HttpStatus.SUCCESS).json({ success: true, bookingList: result.bookingList });
                } else {
                    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
                }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error:any) {
                console.error("Failed to get booking list for admin:", error);
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to get booking list for admin" });
            }
        }
    
        async countBookings(_req: AuthRequest, res: Response):Promise<void>{
            try {
                const response =  await this._bookingService.countBookings()
                res.status(HttpStatus.SUCCESS).json(response)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error:any) {
                console.error("Error counting all bookings:", error);
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to count all bookings" });
            }
        }

        async initiateWorkComplete(req: AuthRequest, res: Response): Promise<void> {
            try {
                const userId=req.user?.id.toString() || ''
                const bookingId = req.query.bookingId as string
                const result = await this._bookingService.initiateWorkComplete(userId, bookingId!)
                res.status(HttpStatus.CREATED).json(result)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error:any) {
                console.error("Error initiale work completion:", error);
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to initiale work completion "});
            }
        }

        async verifyWorkComplete(req: AuthRequest, res: Response): Promise<void> {
            try {
                const userId= req.user?.id.toString()||''
                // const bookingId = req.query.bookingId as string
                const {otp, bookingId}= req.body
                const result = await this._bookingService.verifyWorkComplete(userId,bookingId,otp)
                res.status(HttpStatus.CREATED).json(result)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error:any) {
                console.error("Error verify work completion with OTP:", error);
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed verify work completion with OTP" });
            }
        }
}