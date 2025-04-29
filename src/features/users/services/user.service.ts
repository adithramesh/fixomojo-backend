import { inject, injectable } from "inversify";
import { HomeRequestDTO, HomeResponseDTO } from "../dto/home.dto";
import { IUserService } from "./user.service.interface";
import { TYPES } from "../../../types/types";
import { UserRepository } from "../../../repositories/user.repository";
import { ServiceRepository } from "../../../repositories/service.repository";

@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(TYPES.UserRepository) private _userRepository:UserRepository,
        @inject(TYPES.ServiceRepository) private _serviceRepository:ServiceRepository
    ){}
    async getHome(data: HomeRequestDTO): Promise<HomeResponseDTO> {
       const userData= await this._userRepository.findUserById(data.userId)
       const serviceData = await this._serviceRepository.findAllServices()
       const homeData={
        userName:userData?.username,
        phoneNumber:userData?.phoneNumber,
        serviceNames:serviceData
       }
       return homeData

    }
}