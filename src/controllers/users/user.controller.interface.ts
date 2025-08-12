import {Request, Response} from "express"
import { HomeResponseDTO } from "../../dto/home.dto"
import { AuthRequest } from "../../middlewares/auth.middleware"

export interface IUserController {
    getHome(req:Request, res:Response<HomeResponseDTO>):Promise<void>
    bookService(req: Request, res: Response):Promise<void>
    verifyPayment(req: Request, res: Response):Promise<void>
    getProfile(req:AuthRequest, res:Response):Promise<void>
    updateProfile(req:AuthRequest, res:Response):Promise<void>
}