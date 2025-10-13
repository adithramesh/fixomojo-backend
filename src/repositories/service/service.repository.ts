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

    async findServiceById(id: string): Promise<IService | null> {
        return await this.findById(id)
    }

    async updateService(id: string, updateData: mongoose.UpdateQuery<IService>): Promise<IService | null> {
        return await this.update(id,updateData);
    }
    
    async findServciesPaginated(skip: number, limit: number, sortBy: string, sortOrder: string, filter: Record<string, unknown>): Promise<IService[]> {
        const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1; 
        const sortOptions: Record<string, 1 | -1> = sortBy ? { [sortBy]: sortDirection } : {}; 
         return await Service.find(filter).sort(sortOptions).skip(skip).limit(limit).exec();
    }

    async countServices(filter: Record<string, unknown>= {}): Promise<number> {
        return await this.count(filter) 
    }


    async findAllActiveServices(): Promise<IService[]> {
        return await this.find({ status: 'active' });
    }
}