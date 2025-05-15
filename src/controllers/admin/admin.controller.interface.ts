import {Request, Response} from "express"
import { ServiceResponseDTO, ServiceRequestDTO, UserResponseDTO, PaginatedResponseDTO } from "../../dto/admin.dto"

export interface IAdminController {
    addService(req: Request<ServiceRequestDTO>, res: Response<ServiceResponseDTO>): Promise<void>
    getUsers(req:Request, res:Response<PaginatedResponseDTO<UserResponseDTO[]>>):Promise<void>
    getServices(req:Request, res:Response<PaginatedResponseDTO<ServiceResponseDTO[]>>):Promise<void>
    changeUserStatus(req:Request, res:Response<UserResponseDTO>):Promise<void>
    changeServiceStatus(req:Request, res:Response<ServiceResponseDTO>):Promise<void>
}   