import {Request, Response} from "express"
import { HomeResponseDTO } from "../../dto/home.dto"


export interface IUserController {
    getHome(req:Request, res:Response<HomeResponseDTO>):Promise<void>
}