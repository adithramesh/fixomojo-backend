import mongoose from "mongoose";
import Service, { IService } from "../../models/service.models";
import { BaseRepository } from "../base.repository";
import { IServiceRepository } from "./service.repository.interface";

export class ServiceRepository extends BaseRepository<IService> implements IServiceRepository {
    constructor(){
        super(Service)
    }
    async createService(serviceData: Partial<IService>): Promise<IService> {
        const service = await this.create(serviceData)
        return  service
    }

    // async findAllServices(): Promise<string[]> {
    //     const services = await this.find()
    //     const serviceNames :string[]=services.map(service=>service.serviceName)
    //     return serviceNames
    // }
    //   async findAllServices(): Promise<IService> {
    //     const services = await this.find()
        
    //     return services
    // }

    async findServiceById(id: string): Promise<IService | null> {
        return await this.findById(id)
    }

    async updateService(id: string, updateData: mongoose.UpdateQuery<IService>): Promise<IService | null> {
        return await this.update(id,updateData);
    }
    
    async findServciesPaginated(skip: number, limit: number, sortBy: string, sortOrder: string, filter: Record<string, unknown>): Promise<IService[]> {
        const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1; // Explicitly type sortDirection
        const sortOptions: Record<string, 1 | -1> = sortBy ? { [sortBy]: sortDirection } : {}; // Use Record and handle empty sortBy
         return await Service.find(filter).sort(sortOptions).skip(skip).limit(limit).exec();
    }

    async countServices(filter: Record<string, unknown>= {}): Promise<number> {
        return await this.count(filter) 
    }
}