import { Response } from "express";
import { inject, injectable } from "inversify";
import { ITransactionController } from "./transaction.controller.interface";
// import { TransactionService } from "../../services/transaction/transaction.service";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { PaginationRequestDTO } from "../../dto/admin.dto";
import { ITransactionService } from "../../services/transaction/transaction.service.interface";

@injectable()
export class TransactionController implements ITransactionController{
    constructor(
        // @inject(TYPES.TransactionService) private _transactionService:TransactionService
        @inject(TYPES.ITransactionService) private _transactionService:ITransactionService
    ){}

    async logTransaction(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId=req.user?.id.toString() || ''
            const bookingId=req.query.bookingId as string
            const amount=parseInt(req.query.amount as string) || 0
            const data={
                userId,
                bookingId,
                amount,
    
            }
            const result= await this._transactionService.logTransaction(data!)
            if (result.success) {
                res.status(HttpStatus.SUCCESS).json({ success: true, transaction: result.transaction });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
            }           

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Failed to log transactior:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to log transaction" });
        }
    }

    async getTransactionByUser(req: AuthRequest, res: Response): Promise<void> {
        try {
            const pagination: PaginationRequestDTO = {
                    page: parseInt(req.query.page as string) || 1,
                    pageSize: parseInt(req.query.pageSize as string) || 10,
                    sortBy: (req.query.sortBy as string) || 'transactionId',
                    sortOrder: (req.query.sortOrder as string) || 'desc',
                    searchTerm: req.query.searchTerm as string || '',
                    filter:  {},
                 
                  };             
             const userId=req.user?.id.toString() || ''
            //  const role = req.user?.role
             const result= await this._transactionService.getTransactionByUserPaginated(pagination,userId)
             console.log("result transaction", result)
            if (result.success) {
                res.status(HttpStatus.SUCCESS).json({ success: true, transaction: result.transactionList });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
            }   
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Failed to users transactior:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to users transaction" });
        }
    }

    async countTransactions(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId=req.user?.id.toString() || ''
            const response =  await this._transactionService.countTransaction(userId)
            res.status(HttpStatus.SUCCESS).json(response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error counting all transactions:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to count all transactions" });
        }
    }
}