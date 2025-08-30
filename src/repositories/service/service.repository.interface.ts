import { IService } from "../../models/service.models";

export interface IServiceRepository {
    createService(serviceData:Partial<IService>):Promise<IService>;
    findServiceById(id: string):Promise<IService | null>;
    updateService(id:string, updateData:Partial<IService>): Promise<IService |null>
    findServciesPaginated(skip: number,limit: number,sortBy: string,sortOrder: string,filter:Record<string, unknown>):Promise<IService[]>
    countServices(filter: Record<string, unknown>):Promise<number>
}