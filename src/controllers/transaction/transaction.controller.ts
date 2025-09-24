import { Response } from "express";
import { inject, injectable } from "inversify";
import { ITransactionController } from "./transaction.controller.interface";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { PaginationRequestDTO } from "../../dto/admin.dto";
import { ITransactionService } from "../../services/transaction/transaction.service.interface";

@injectable()
export class TransactionController implements ITransactionController{
    constructor(
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
            const query = req.query;
            const filter : Record<string, unknown> = {};
            if(query.dateFrom) filter.createdAt = {$gte: new Date(query.dateFrom as string)}
            if(query.dateTo) {
                  const dateTo = new Date(query.dateTo as string);
  
                    dateTo.setHours(23, 59, 59, 999);

                    if (filter.createdAt) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (filter.createdAt as any).$lte = dateTo;
                    } else {
                        filter.createdAt = { $lte: dateTo };
                    }
                
            }
            if(query.transactionType) filter.transactionType = query.transactionType
            if(query.minAmount || query.maxAmount){
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const amountFilter:any = {}
                if (query.minAmount) amountFilter.$gte = parseFloat(query.minAmount as string);
                if (query.maxAmount) amountFilter.$lte = parseFloat(query.maxAmount as string);
                filter.amount = amountFilter;
            }

            const pagination: PaginationRequestDTO = {
                    page: parseInt(req.query.page as string) || 1,
                    pageSize: parseInt(req.query.pageSize as string) || 10,
                    sortBy: (req.query.sortBy as string) || 'transactionId',
                    sortOrder: (req.query.sortOrder as string) || 'desc',
                    searchTerm: req.query.searchTerm as string || '',
                    filter: filter,
                 
                  };             
             const userId=req.user?.id.toString() || ''
            //  const role = req.user?.role
             const result= await this._transactionService.getTransactionByUserPaginated(pagination,userId)
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
            const query = req.query;
            const filter : Record<string, unknown> = {};
            if(query.dateFrom) filter.createdAt = {$gte: new Date(query.dateFrom as string)}
            if(query.dateTo) {
                if(filter.createdAt){
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (filter.createdAt as any).$lte = new Date(query.dateTo as string)
                }else{
                    filter.createdAt = { $lte: new Date(query.dateTo as string)}
                }
            }
            if(query.transactionType) filter.transactionType = query.transactionType
            if(query.minAmount || query.maxAmount){
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const amountFilter:any = {}
                if (query.minAmount) amountFilter.$gte = parseFloat(query.minAmount as string);
                if (query.maxAmount) amountFilter.$lte = parseFloat(query.maxAmount as string);
                filter.amount = amountFilter;
            }

            const response =  await this._transactionService.countTransaction(userId,filter)
            res.status(HttpStatus.SUCCESS).json(response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error counting all transactions:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to count all transactions" });
        }
    }
}