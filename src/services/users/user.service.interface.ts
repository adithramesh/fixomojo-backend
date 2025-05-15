import { HomeResponseDTO } from "../../dto/home.dto";

export interface IUserService {
    getHome():Promise<HomeResponseDTO>
}