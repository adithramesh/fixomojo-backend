import {Request, Response} from "express"
import { HomeRequestDTO, HomeResponseDTO } from "../dto/home.dto";

export interface IUserController {
    getHome(HomeRequestDTO:Request<HomeRequestDTO>, res:Response<HomeResponseDTO>):Promise<void>
}