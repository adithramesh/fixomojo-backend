import { HomeRequestDTO, HomeResponseDTO } from "../dto/home.dto";

export interface IUserService {
    getHome(data:HomeRequestDTO):Promise<HomeResponseDTO>
}