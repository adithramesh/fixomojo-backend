import { PaginatedResponseDTO, PaginationRequestDTO } from "../../dto/admin.dto";
import { IBooking } from "../../models/booking.model";

export interface IBookingService {
    getBookings(pagination: PaginationRequestDTO, userId:string, role:string):Promise<{success: boolean; message: string; bookingList?:PaginatedResponseDTO<IBooking[]>}>
    getBookingById(bookingId:string):Promise<{success:boolean, message:string, data?: Partial<IBooking>}>
    getAllBookingsForAdmin(pagination: PaginationRequestDTO):Promise<{success: boolean; message: string; bookingList?:PaginatedResponseDTO<IBooking[]>}>
    initiateWorkComplete(userId:string, bookingId:string):Promise<{success:boolean; message:string}>
    verifyWorkComplete(technicianId:string, bookingId:string, otp:string):Promise<{success:boolean;message:string}>
}