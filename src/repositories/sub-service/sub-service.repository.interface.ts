import { ISubService } from "../../models/sub-service.model";

export interface IServiceRepository {
    createSubService(serviceData:Partial<ISubService>):Promise<ISubService>
    findAllSubServices():Promise<string[]>
    findSubServiceById(id: string):Promise<ISubService | null>;
    updateSubService(id:string, updateData:Partial<ISubService>): Promise<ISubService |null>
    findSubServciesPaginated(skip: number,limit: number,sortBy: string,sortOrder: string,filter:Record<string, unknown>):Promise<ISubService[]>
    countSubServices(filter: Record<string, unknown>):Promise<number>
}