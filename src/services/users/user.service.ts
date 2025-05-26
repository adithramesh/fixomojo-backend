import { inject, injectable } from "inversify";
import { HomeResponseDTO } from "../../dto/home.dto";
import { IUserService } from "./user.service.interface";
import { TYPES } from "../../types/types";
import { UserRepository } from "../../repositories/user/user.repository";
import { ServiceRepository } from "../../repositories/service/service.repository";

@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(TYPES.UserRepository) private _userRepository:UserRepository,
        @inject(TYPES.ServiceRepository) private _serviceRepository:ServiceRepository
    ){}
    async getHome(): Promise<HomeResponseDTO> {
       const serviceData = await this._serviceRepository.findAllServices()
       const homeData={
        serviceNames:serviceData
       }
       return homeData
    }
}