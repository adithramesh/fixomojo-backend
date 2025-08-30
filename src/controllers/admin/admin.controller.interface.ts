import {Request, Response} from "express"
import { ServiceResponseDTO, ServiceRequestDTO, UserResponseDTO, PaginatedResponseDTO, SubServiceResponseDTO, AdminDashboardResponseDTO } from "../../dto/admin.dto"
import { AuthRequest } from "../../middlewares/auth.middleware";
import { StreamTokenResponseDTO } from "../../dto/stream.dto";
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
    getDashboard(req:AuthRequest,res:Response<AdminDashboardResponseDTO>):Promise<void>
    getStreamToken(req:AuthRequest,res: Response<StreamTokenResponseDTO>):Promise<void>
}   