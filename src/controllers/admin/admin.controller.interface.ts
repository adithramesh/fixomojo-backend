import {Request, Response} from "express"
import { ServiceResponseDTO, ServiceRequestDTO, UserResponseDTO, PaginatedResponseDTO, SubServiceResponseDTO } from "../../dto/admin.dto"

export interface IAdminController {
    addService(req: Request<ServiceRequestDTO>, res: Response<ServiceResponseDTO>): Promise<void>
    subService(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
    getUsers(req:Request, res:Response<PaginatedResponseDTO<UserResponseDTO[]>>):Promise<void>
    getServices(req:Request, res:Response<PaginatedResponseDTO<ServiceResponseDTO[]>>):Promise<void>
    getSubServices(req:Request, res:Response<PaginatedResponseDTO<SubServiceResponseDTO[]>>):Promise<void>
    getServiceById(req:Request, res:Response<ServiceResponseDTO>):Promise<void>
    getSubServiceById(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
    changeUserStatus(req:Request, res:Response<UserResponseDTO>):Promise<void>
    changeServiceStatus(req:Request, res:Response<ServiceResponseDTO>):Promise<void>
    changeSubServiceStatus(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
    updateService(req:Request, res:Response<ServiceResponseDTO>):Promise<void>
    updateSubService(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>
}   