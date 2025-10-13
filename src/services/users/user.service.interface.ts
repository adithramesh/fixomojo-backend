import { UserResponseDTO } from "../../dto/admin.dto";
import { BookServiceRequestDTO, BookServiceResponseDTO } from "../../dto/book-service.dto";
import { HomeResponseDTO } from "../../dto/home.dto";
import { PartnerDashboardResponseDTO } from "../../dto/partner.dto";

export interface IUserService {
    getHome(searchTerm: string): Promise<HomeResponseDTO>;
    bookService(data: BookServiceRequestDTO): Promise<BookServiceResponseDTO>
    verifyPayment(sessionId:string, userId:string):Promise<{success:boolean, message:string}>
    getProfile(userId:string):Promise<Partial<UserResponseDTO>>
    updateProfile(userId:string, updatedata:object):Promise<Partial<UserResponseDTO>>
    getPartnerDashboard(userId:string):Promise<PartnerDashboardResponseDTO>
}