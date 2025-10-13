import { PaginatedResponseDTO, PaginationRequestDTO } from "../../dto/admin.dto";
import { BookingResponseDTO } from "../../dto/book-service.dto";

export interface IBookingService {
    getBookings(pagination: PaginationRequestDTO, userId:string, role:string):Promise<{success: boolean; message: string; bookingList?:PaginatedResponseDTO<BookingResponseDTO[]>}>
    getBookingById(bookingId:string):Promise<{success:boolean, message:string, data?: BookingResponseDTO}>
    getAllBookingsForAdmin(pagination: PaginationRequestDTO):Promise<{success: boolean; message: string; bookingList?:PaginatedResponseDTO<BookingResponseDTO[]>}>
    initiateWorkComplete(userId:string, bookingId:string):Promise<{success:boolean; message:string}>
    verifyWorkComplete(technicianId:string, bookingId:string, otp:string):Promise<{success:boolean;message:string}>
    cancelBooking(userId:string, role:string, bookingId:string):Promise<{success:boolean;message:string}>
}