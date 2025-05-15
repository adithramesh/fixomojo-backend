import { PaginatedResponseDTO, PaginationRequestDTO, ServiceRequestDTO, ServiceResponseDTO, UserResponseDTO } from "../../dto/admin.dto";

export interface IAdminService {
    createService(serviceData:ServiceRequestDTO):Promise<ServiceResponseDTO>
    getUsers(pagination: PaginationRequestDTO):Promise<PaginatedResponseDTO<UserResponseDTO[]>>
    getServices(pagination: PaginationRequestDTO):Promise<PaginatedResponseDTO<ServiceResponseDTO[]>>
    changeUserStatus(userId:string, licenseStatus?:string):Promise<UserResponseDTO>
    changeServiceStatus(serviceId:string):Promise<ServiceResponseDTO>
}