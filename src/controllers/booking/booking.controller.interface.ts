import {Request, Response} from "express"
import { AuthRequest } from "../../middlewares/auth.middleware"


export interface IBookingController {
    bookings(req:Request, res:Response):Promise<void>
    getBookingById(req:Request, res:Response):Promise<void>
    getAllBookingsForAdmin(req:AuthRequest, res:Response):Promise<void>
    // countBookings(_req: AuthRequest, res: Response):Promise<void>
    initiateWorkComplete(req:AuthRequest, res:Response):Promise<void>
    verifyWorkComplete(req:AuthRequest, res:Response):Promise<void>
    cancelBooking(req:AuthRequest, res:Response):Promise<void>
}