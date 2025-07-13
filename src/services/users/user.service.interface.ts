import { BookServiceRequestDTO, BookServiceResponseDTO } from "../../dto/book-service.dto";
import { HomeResponseDTO } from "../../dto/home.dto";

export interface IUserService {
    getHome(searchTerm: string): Promise<HomeResponseDTO>;
    bookService(data: BookServiceRequestDTO): Promise<BookServiceResponseDTO>
    verifyPayment(sessionId:string, userId:string):Promise<{success:boolean, message:string}>
}