import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
export interface ITransactionController {
    logTransaction(req:Request,res:Response):Promise<void>
    getTransactionByUser(req:Request,res:Response):Promise<void>
    countTransactions(req:AuthRequest,res:Response):Promise<void>
}