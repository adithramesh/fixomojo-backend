import { Request, Response } from "express";
export interface ITransactionController {
    logTransaction(req:Request,res:Response):Promise<void>
    getTransactionByUser(req:Request,res:Response):Promise<void>
    countTransactions(req:Request,res:Response):Promise<void>
}