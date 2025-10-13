import { AdminDashboardResponseDTO, PaginatedResponseDTO, PaginationRequestDTO, ServiceRequestDTO, ServiceResponseDTO, SubServiceRequestDTO, SubServiceResponseDTO, UserResponseDTO } from "../../dto/admin.dto";
import { ServiceLookupDTO } from "../../dto/offer.dto";

export interface IAdminService {
    createService(serviceData:ServiceRequestDTO):Promise<ServiceResponseDTO>
    createSubService(serviceId: string, subServiceData: SubServiceRequestDTO):Promise<SubServiceResponseDTO>
    getUsers(pagination: PaginationRequestDTO):Promise<PaginatedResponseDTO<UserResponseDTO[]>>
    getServices(pagination: PaginationRequestDTO):Promise<PaginatedResponseDTO<ServiceResponseDTO[]>>
    getSubServices(pagination:PaginationRequestDTO):Promise<PaginatedResponseDTO<SubServiceResponseDTO[]>>
    getServiceById(serviceId:string):Promise<ServiceResponseDTO>
    getSubServiceById(subServiceId:string):Promise<SubServiceResponseDTO>
    changeUserStatus(userId:string, licenseStatus?:string):Promise<UserResponseDTO>
    updateUser(userId:string, updateData:object):Promise<UserResponseDTO>
    changeServiceStatus(serviceId:string):Promise<ServiceResponseDTO>
    changeSubServiceStatus(serviceId:string):Promise<SubServiceResponseDTO>
    updateService(serviceId:string, serviceData:ServiceRequestDTO):Promise<ServiceResponseDTO>
    updateSubService(subServiceId:string, subServiceData:SubServiceRequestDTO):Promise<SubServiceResponseDTO>
    savedLocation(userId:string):Promise<string | undefined>
    getDashboard( startDate?: string, endDate?: string):Promise<AdminDashboardResponseDTO>
    getAllActiveServices(): Promise<ServiceLookupDTO[]>
    // generateStreamToken(userId: string): Promise<string>
    // generateSalesReport(filters: {startDate: Date, endDate: Date}): Promise<Buffer>
}