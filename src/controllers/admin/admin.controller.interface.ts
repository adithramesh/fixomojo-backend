import {Request, Response} from "express"
import { ServiceResponseDTO, ServiceRequestDTO, UserResponseDTO, PaginatedResponseDTO, SubServiceResponseDTO } from "../../dto/admin.dto"
import { AuthRequest } from "../../middlewares/auth.middleware";
type EmptyParams = Record<string, never>;

export interface IAdminController {
    addService(req: Request<EmptyParams, object, ServiceRequestDTO>, res: Response<ServiceResponseDTO>): Promise<void>
    subService(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
    getUsers(req:Request, res:Response<PaginatedResponseDTO<UserResponseDTO[]>>):Promise<void>
    getServices(req:Request, res:Response<PaginatedResponseDTO<ServiceResponseDTO[]>>):Promise<void>
    getSubServices(req:Request, res:Response<PaginatedResponseDTO<SubServiceResponseDTO[]>>):Promise<void>
    getServiceById(req:Request, res:Response<ServiceResponseDTO>):Promise<void>
    getSubServiceById(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
    changeUserStatus(req:Request, res:Response<UserResponseDTO>):Promise<void>
    updateUser(req:Request, res:Response<UserResponseDTO>):Promise<void>
    changeServiceStatus(req:Request, res:Response<ServiceResponseDTO>):Promise<void>
    changeSubServiceStatus(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
    updateService(req:Request, res:Response<ServiceResponseDTO>):Promise<void>
    updateSubService(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
    savedLocation(req:AuthRequest,res:Response<string>):Promise<void>
}   