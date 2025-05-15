import { inject, injectable } from "inversify";
import { PaginatedResponseDTO, PaginationRequestDTO, ServiceRequestDTO, ServiceResponseDTO, UserResponseDTO } from "../../dto/admin.dto";
import { IAdminService } from "./admin.service.interface";
import { ServiceRepository } from "../../repositories/service.repository";
import { TYPES } from "../../types/types";
import { IService } from "../../models/service.models";
import { UserRepository } from "../../repositories/user.repository";
import mongoose from "mongoose";
import { IUser } from "../../models/user.model";

@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TYPES.ServiceRepository) private _serviceRepository:ServiceRepository,
        @inject(TYPES.UserRepository) private _userRepository:UserRepository
    ){}
    async createService(serviceData: ServiceRequestDTO): Promise<ServiceResponseDTO> {
        const { serviceName, image, description } = serviceData;
        try {
        const createdService: IService = await this._serviceRepository.createService({
            serviceName,
            image,
            description
          });
    
          return {
            serviceName: createdService.serviceName,
            image: createdService.image,
            description: createdService.description,
            status: createdService.status, 
          };
       } catch (error) {
        console.error("Error creating service:", error);
        throw error;
       }
    }


    async getUsers(pagination: PaginationRequestDTO):Promise<PaginatedResponseDTO<UserResponseDTO[]>> {
      try {
        const { page, pageSize, sortBy, sortOrder, filter } = pagination;
        const skip = (page - 1) * pageSize;
        
        const users = await this._userRepository.findUsersPaginated(skip, pageSize, sortBy?sortBy:'', sortOrder?sortOrder:'', filter);
        const totalUsers = await this._userRepository.countUsers(filter);
        
        const userDTOs: UserResponseDTO[] = users.map(user => ({
          id: (user._id as mongoose.Types.ObjectId).toString(),
          username: user.username || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          status: user.status,
          licenseStatus:user.licenseStatus,
          role: user.role || '',
          createdAt: user.createdAt ? user.createdAt.toISOString() : ''
        }));
  
        return {
          items: userDTOs,
          total: totalUsers,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(totalUsers / pageSize)
        };
      } catch (error) {
        console.error("Error in getUsers service:", error);
        throw error;
      }
    }

    async getServices(pagination: PaginationRequestDTO): Promise<PaginatedResponseDTO<ServiceResponseDTO[]>> {
      try {
        const {page, pageSize, sortBy, sortOrder,filter}=pagination
        const skip = (page - 1) * pageSize;
        const services = await this._serviceRepository.findServciesPaginated(skip,pageSize,sortBy?sortBy:'', sortOrder?sortOrder:'',filter?filter:{})
        const totalServices = await this._serviceRepository.countServices(filter)

        const serviceDTOs:ServiceResponseDTO[]=services.map(service=>({
          id:(service._id as mongoose.Types.ObjectId).toString(),
          serviceName: service.serviceName,
          image: service.image,
          description: service.description,
          status: service.status,
          createdAt: service.createdAt ? service.createdAt.toISOString() : ''
        }))
       
        
        return {
          items: serviceDTOs,
          total: totalServices,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(totalServices / pageSize)
        };
      } catch (error) {
        console.error("Error in getServices service:", error);
        throw error;
      }
    }

    async changeUserStatus(userId: string, licenseStatus?: string): Promise<UserResponseDTO> {
      try {
        const user: IUser | null = await this._userRepository.findUserById(userId);
        if (!user) {
          throw new Error('User not found to update status'); 
        }
        const updates: Partial<IUser> = {};

        if (licenseStatus) {
          updates.licenseStatus = licenseStatus;
          // Update status based on licenseStatus for partners
          if (user.role === 'partner') {
            updates.status = licenseStatus === 'approved' ? 'active' : 'pending';
          }
        }
      
        else {
          console.log("else block");
          updates.status = user.status === 'active' ? 'blocked' : 'active';
        }
        console.log("updates", updates);
        
        const upus =await this._userRepository.updateUser(userId, updates);
        console.log("upus", upus);
          
        const updatedUser: IUser | null = await this._userRepository.findUserById(userId);
        console.log("updatedUser", updatedUser);
        
        if(!updatedUser){
          throw new Error('Failed to retrieve updated user');
        }
    
        return {
          id: (updatedUser._id as mongoose.Types.ObjectId).toString(),
          username: updatedUser.username,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          status: updatedUser.status,
          licenseStatus:updatedUser.licenseStatus,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt ? updatedUser.createdAt.toISOString() : '',
        };
      } catch (error) {
        console.error("Error in changeUserStatus service:", error);
        throw error;
      }
    }
    async changeServiceStatus(serviceId: string): Promise<ServiceResponseDTO> {
      try {
        const service: IService | null = await this._serviceRepository.findServiceById(serviceId);
        if (!service) {
          throw new Error('Service not found to update status'); 
        }

        const newStatus = service.status === 'active' ? 'blocked' : 'active';
        await this._serviceRepository.updateService(serviceId, { status: newStatus });

        const updatedService: IService | null = await this._serviceRepository.findServiceById(serviceId);
        if(!updatedService){
          throw new Error('Failed to retrieve updated service');
        }
    
        return {
          id: (updatedService._id as mongoose.Types.ObjectId).toString(),
          serviceName: updatedService.serviceName,
          status: updatedService.status,
          createdAt: updatedService.createdAt ? updatedService.createdAt.toISOString() : '',
        };
      } catch (error) {
        console.error("Error in changeServiceStatus service:", error);
        throw error;
      }
    }
}