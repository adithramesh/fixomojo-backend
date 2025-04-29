import Service, { IService } from "../models/service.models";
import { IServiceRepository } from "./service.repository.interface";

export class ServiceRepository implements IServiceRepository {
    async createService(serviceData: IService): Promise<string> {
        const service = await Service.create(serviceData)
        return  service.serviceName
    }

    async findAllServices(): Promise<string[]> {
        const services = await Service.find()
        const serviceNames :string[]=services.map(service=>service.serviceName)
        return serviceNames

    }
}