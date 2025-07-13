import mongoose, { FilterQuery } from 'mongoose';
import SubService, { ISubService } from '../../models/sub-service.model';
import { BaseRepository } from '../base.repository';
import { ISubServiceRepository } from './sub-service.repository.interface';

export class SubServiceRepository extends BaseRepository<ISubService> implements ISubServiceRepository {
  constructor() {
    super(SubService)
  }

  async createSubService(serviceData: Partial<ISubService>): Promise<ISubService> {
    try {
      // Ensure required fields are provided
      if (!serviceData.subServiceName || !serviceData.serviceId || !serviceData.price) {
        throw new Error('Missing required fields: subServiceName, serviceId, or price');
      }
      // Set default status if not provided
      const subServiceData = {
        ...serviceData,
        status: serviceData.status || 'active'
      };
      const createdSubService = await this.create(subServiceData);
      return await this.model
        .findById(createdSubService._id)
        .populate('serviceId', 'serviceName')
        .lean()
        .exec() as ISubService
    } catch (error) {
      console.error('Error creating sub-service in repository:', error);
      throw error;
    }
  }

  async findSubServicesPaginated(
    skip: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterQuery<ISubService>
  ): Promise<ISubService[]> {
    const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = sortBy ? { [sortBy]: sortDirection } : {};
    return await this.model
      .find(filter)
      .populate('serviceId', 'serviceName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<ISubService | null> {
    return await this.model
      .findById(id)
      .populate('serviceId', 'serviceName')
      .exec();
  }

  async updateSubService(id: string, updateData: mongoose.UpdateQuery<ISubService>): Promise<ISubService | null> {
    return await this.update(id,updateData);
  }

  async countSubServices(filter: Record<string, unknown>):Promise<number>{
     return await this.count(filter) 
  }
}