import { IService } from "../models/service.models";

export interface IServiceRepository {
    createService(serviceData:IService):Promise<string>
    findAllServices():Promise<string[]>
}