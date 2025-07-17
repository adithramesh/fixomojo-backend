import { FilterQuery } from "mongoose";
import { ISubService } from "../../models/sub-service.model";
import { SubServiceRequestDTO } from "../../dto/admin.dto";

export interface ISubServiceRepository {
    createSubService(serviceData:Partial<ISubService>):Promise<ISubService>
    // findSubServiceById(id: string):Promise<ISubService | null>;
    findById(id: string): Promise<ISubService | null>
    updateSubService(id:string, updateData:Partial<SubServiceRequestDTO>): Promise<ISubService |null>
    findSubServicesPaginated(skip: number,limit: number,sortBy: string,sortOrder: string,filter: FilterQuery<ISubService>): Promise<ISubService[]>
    countSubServices(filter: Record<string, unknown>):Promise<number>
}