import { inject, injectable } from "inversify";
import { PaginatedResponseDTO, PaginationRequestDTO, ServiceRequestDTO, ServiceResponseDTO, SubServiceRequestDTO, SubServiceResponseDTO, UserResponseDTO } from "../../dto/admin.dto";
import { IAdminService } from "./admin.service.interface";
import { ServiceRepository } from "../../repositories/service/service.repository";
import { TYPES } from "../../types/types";
import { IService} from "../../models/service.models";
import { ISubService } from "../../models/sub-service.model";
import { UserRepository } from "../../repositories/user/user.repository";
import mongoose from "mongoose";
import { IUser } from "../../models/user.model";
import { SubServiceRepository } from "../../repositories/sub-service/sub-service.repository";


@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TYPES.ServiceRepository) private _serviceRepository:ServiceRepository,
        @inject(TYPES.UserRepository) private _userRepository:UserRepository,
        @inject(TYPES.SubServiceRepository) private _subServiceRepository:SubServiceRepository
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

    
    async createSubService(serviceId: string, subServiceData: SubServiceRequestDTO): Promise<SubServiceResponseDTO> {
    try {
      console.log("create sub-service, service layer, serviceId: ", serviceId);
      console.log("create sub-service,service layer, subServiceData: ", subServiceData);
      const parentService = await this._serviceRepository.findById(serviceId);
      if (!parentService) {
        throw new Error('Service not found');
      }

      // Create sub-service with serviceId
      const subServiceDataWithServiceId = {
        ...subServiceData,
        serviceId: new mongoose.Types.ObjectId(serviceId),
        // serviceId,
        serviceName:parentService.serviceName,
        status: subServiceData.status || 'active' // Default status
      };

      const createdSubService:ISubService = await this._subServiceRepository.create(subServiceDataWithServiceId);

      // Return SubServiceResponseDTO
      return {
        id: (createdSubService._id as mongoose.Types.ObjectId).toString(),
        subServiceName: createdSubService.subServiceName,
        serviceId: createdSubService.serviceId.toString(),
        // serviceId: createdSubService.serviceId,
        serviceName: createdSubService.serviceName,
        price: createdSubService.price,
        description: createdSubService.description,
        image: createdSubService.image,
        status: createdSubService.status,
        createdAt: createdSubService.createdAt?.toISOString(),
        updatedAt: createdSubService.updatedAt?.toISOString()
      };
       } catch (error) {
          console.error('Error creating sub-service:', error);
          throw error;
        }
     }

    async getUsers(pagination: PaginationRequestDTO):Promise<PaginatedResponseDTO<UserResponseDTO[]>> {
      try {
        const { page, pageSize, sortBy, sortOrder,searchTerm, filter={} } = pagination;
        const skip = (page - 1) * pageSize;

        if (searchTerm) {
        filter.$or = [
          { username: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
        }
        
        const users = await this._userRepository.findUsersPaginated(skip, pageSize, sortBy?sortBy:'', sortOrder?sortOrder:'', filter?filter:{});
        const totalUsers = await this._userRepository.countUsers(filter);
        
        const userDTOs: UserResponseDTO[] = users.map(user => ({
          id: (user._id as mongoose.Types.ObjectId).toString(),
          username: user.username || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          status: user.status,
          licenseStatus:user.licenseStatus,
          role: user.role || '',
          location: user.location ? {
            address: user.location.address,
            latitude: user.location.latitude,
            longitude: user.location.longitude
          } : undefined,
          rating: user.rating || 4.5, 
          experience: user.experience || 2,
          createdAt: user.createdAt ? user.createdAt.toISOString() : ''
        }));
        console.log("user DTO", userDTOs);
        
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
        const {page, pageSize, sortBy, sortOrder, searchTerm, filter={}}=pagination
        const skip = (page - 1) * pageSize;

        if (searchTerm) {
        filter.$or = [
          { serviceName: { $regex: searchTerm, $options: 'i' } },
          { 'subServices.subServiceName': { $regex: searchTerm, $options: 'i' } }
        ];
        }


        console.log("filter", filter);
        
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

    async getSubServices(pagination: PaginationRequestDTO): Promise<PaginatedResponseDTO<SubServiceResponseDTO[]>> {
    try {
      const { page, pageSize, sortBy, sortOrder, searchTerm, filter = {} } = pagination;
      const skip = (page - 1) * pageSize;

      if (searchTerm) {
        filter.subServiceName = { $regex: searchTerm, $options: 'i' };
      }

      if (filter.serviceId) {
        filter.serviceId = new mongoose.Types.ObjectId(filter.serviceId);
      }

      

      console.log('Filter applied1:', filter);

      const subServices = await this._subServiceRepository.findSubServicesPaginated(
        skip,
        pageSize,
        sortBy || 'subServiceName',
        sortOrder || 'asc',
        filter
      );
      if(subServices){
        console.log("subServices",subServices);
      }else{
        console.log("repo failed");
      }
      const totalSubServices = await this._subServiceRepository.countSubServices(filter);

      const subServiceDTOs: SubServiceResponseDTO[] = subServices.map(subService => ({
        id: (subService._id as mongoose.Types.ObjectId).toString(),
        subServiceName: subService.subServiceName,
        // serviceId: subService.serviceId.toString(),
        serviceId: subService.serviceId ? subService.serviceId._id.toString() : '',
        serviceName: subService.serviceName || '', // Populated from Service
        image: subService.image || '',
        description: subService.description || '',
        status: subService.status,
        price: subService.price,
        createdAt: subService.createdAt ? subService.createdAt.toISOString() : ''
      }));

      return {
        items: subServiceDTOs,
        total: totalSubServices,
        page,
        pageSize,
        totalPages: Math.ceil(totalSubServices / pageSize)
      };
    } catch (error) {
      console.error('Error in getSubServices service:', error);
      throw error;
    }
  }

  async getServiceById(serviceId:string):Promise<ServiceResponseDTO>{
    try {
      const service= await this._serviceRepository.findServiceById(serviceId)
      if (!service) {
      throw new Error(`Service with ID ${serviceId} not found`);
      }
      return {
        serviceName:service?.serviceName ,
        description:service?.description,
        image:service?.image,
        status:service?.status
      }
    } catch (error) {
      console.error('Error in getServiceById service:', error);
      throw error;
    }
  }

  async getSubServiceById(subServiceId:string):Promise<SubServiceResponseDTO>{
    try {
      const subService = await this._subServiceRepository.findById(subServiceId)
      console.log("subService: ", subService);
      
      if (!subService) {
      throw new Error(`Sub-service with ID ${subServiceId} not found`);
      }
      return {
        id:(subService._id as mongoose.Types.ObjectId).toString(),
        serviceId:(subService.serviceId._id as mongoose.Types.ObjectId).toString(),
        // serviceName: subService.serviceId.serviceName,
        subServiceName:subService?.subServiceName,
        description:subService?.description,
        image:subService?.image,
        price:subService?.price,
        status:subService.status
      }
    } catch (error) {
      console.error('Error in getSubServiceById service:', error);
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

    async updateUser(userId: string, updateData: Partial<IUser>): Promise<UserResponseDTO> {
      try {
        const user = await this._userRepository.findUserById(userId)
        if(!user){
          throw new Error('Service not found to update'); 
        }
        console.log("update data in service", updateData);
        
        await this._userRepository.updateUser(userId, updateData)

        const updatedUser = await this._userRepository.findUserById(userId)
         if(!updatedUser){
          throw new Error('Failed to retrieve updated service');
        }
        return {
          id: (updatedUser._id as mongoose.Types.ObjectId).toString(),
          username: updatedUser.username,
          email:updatedUser.email,
          phoneNumber:updatedUser.phoneNumber,
          status: updatedUser.status,
          role:updatedUser.role,
          location:updatedUser.location,
          createdAt: updatedUser.createdAt ? updatedUser.createdAt.toISOString() : '',
        }

      } catch (error) {
        console.error("Error in updateSubService service:", error);
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

    async changeSubServiceStatus(subServiceId:string):Promise<SubServiceResponseDTO>{
      try {
        const subService: ISubService | null = await this._subServiceRepository.findById(subServiceId);
        if (!subService) {
          throw new Error('Service not found to update status'); 
        }

        const newStatus = subService.status === 'active' ? 'blocked' : 'active';
        await this._subServiceRepository.updateSubService(subServiceId, { status: newStatus });

        const updatedSubService: ISubService | null = await this._subServiceRepository.findById(subServiceId);
        if(!updatedSubService){
          throw new Error('Failed to retrieve updated service');
        }
    
        return {
          id: (updatedSubService._id as mongoose.Types.ObjectId).toString(),
          subServiceName: updatedSubService.serviceName,
          status: updatedSubService.status,
          createdAt: updatedSubService.createdAt ? updatedSubService.createdAt.toISOString() : '',
        };
      } catch (error) {
        console.error("Error in changeSubServiceStatus service:", error);
        throw error;
      }
    }

    async  updateService(serviceId:string, serviceData:ServiceRequestDTO):Promise<ServiceResponseDTO>{
      try {
        const service = await this._serviceRepository.findServiceById(serviceId)
        if(!service){
          throw new Error('Service not found to update'); 
        }
        await this._serviceRepository.updateService(serviceId, serviceData)

        const updatedService = await this._serviceRepository.findServiceById(serviceId)
         if(!updatedService){
          throw new Error('Failed to retrieve updated service');
        }
        return {
          id: (updatedService._id as mongoose.Types.ObjectId).toString(),
          serviceName: updatedService.serviceName,
          status: updatedService.status,
          image:updatedService.image,
          createdAt: updatedService.createdAt ? updatedService.createdAt.toISOString() : '',
        }

      } catch (error) {
        console.error("Error in updateSubService service:", error);
        throw error;
      }
    }

    async updateSubService(subServiceId:string, subServiceData:SubServiceRequestDTO):Promise<SubServiceResponseDTO>{
      try {
        const subService = await this._subServiceRepository.findById(subServiceId)
        console.log("update sub-service, service layer, serviceId: ", subServiceId);
        console.log("update sub-service,service layer, subServiceData: ", subServiceData);
        if(!subService){
          throw new Error('Sub-service not found to update'); 
        }
        console.log("subServiceId, subServiceData", subServiceId, subServiceData);
        
        await this._subServiceRepository.updateSubService(subServiceId, subServiceData)

        const updatedSubService = await this._subServiceRepository.findById(subServiceId)
        console.log("updatedSubService", updatedSubService);
        
         if(!updatedSubService){
          throw new Error('Failed to retrieve updated service');
        }
        return {
          id: (updatedSubService._id as mongoose.Types.ObjectId).toString(),
          subServiceName: updatedSubService.serviceName,
          status: updatedSubService.status,
          image:updatedSubService.image,
          createdAt: updatedSubService.createdAt ? updatedSubService.createdAt.toISOString() : '',
        }

      } catch (error) {
        console.error("Error in updateSubService service:", error);
        throw error;
      }
    }

    async savedLocation(userId: string): Promise<string | undefined> {
      try {
        const result = await this._userRepository.findById(userId)
        return result?.location?.address || ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error:any) {
        console.error("Error in saved location service:", error);
        throw error;
      }
    }
}
