import {Request, Response} from "express"
import { AuthRequest } from "../../middlewares/auth.middleware"


export interface IChatController {
    getChatHistory(req:Request, res:Response):Promise<void>
    getActiveChats(req:AuthRequest, res:Response):Promise<void>
}