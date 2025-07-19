import { inject, injectable } from "inversify";
import { ITransaction } from "../../models/transaction.model";
import { ITransactionService } from "./transaction.service.interface";
// import { TransactionRepository } from "../../repositories/transaction/transaction.repository";
import { TYPES } from "../../types/types";
import { PaginationRequestDTO } from "../../dto/admin.dto";
import { ITransactionRepository } from "../../repositories/transaction/transaction.repository.interface";

@injectable()
export class TransactionService implements ITransactionService{
    constructor(
        // @inject(TYPES.TransactionRepository) private _transactionRepository:TransactionRepository
        @inject(TYPES.ITransactionRepository) private _transactionRepository:ITransactionRepository
    ){}
    async logTransaction(data: Partial<ITransaction>): Promise<{transaction?:Partial<ITransaction>,success:boolean,  message:string}> {
        try {
            console.log("data inside transaction service log transaction:", data)
            const response= await this._transactionRepository.logTransaction(data)
            return {
                success:false,
                transaction:response,
                message:"Transaction log created successfully"
            }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Failed to log transaction",error)
            return {success:false, message: "Failed to log transaction"}
        }
    }

    async getTransactionByReference(referenceId: string): Promise<ITransaction | null> {
        return await this._transactionRepository.getTransactionByReference(referenceId);
        }

    async getTransactionByUserPaginated(pagination: PaginationRequestDTO, userId:string):Promise<{ success: boolean; message: string; transactionList?: Partial<ITransaction[]> }> {
        try {
          const { page, pageSize, sortBy, sortOrder, filter = {} } = pagination; 
          const skip = (page-1)*pageSize
          filter.userId=userId
        //    if (searchTerm) {
        //       filter._id = { $regex: searchTerm, $options: 'i' };
        //     }
          
          const transactionList=await this._transactionRepository.findTransactionsPaginated(skip,pageSize,sortBy || 'transactionId',sortOrder||'desc', filter)
          console.log("transactionList", transactionList);
          
          return {success:true, message:"complete transaction of a user from service", transactionList}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error in getting users transaction in service:", error);
            return {
                success: false,
                message: `Error in getting users transaction in service: ${error.message || error}`,
            };
        }
    }

    async countTransaction(userId: string): Promise<{count?:number,success:boolean, message:string}> {
        try {
            const count = await this._transactionRepository.countTransactions(userId)
            
            return{
                success:true,
                count,
                message:"Count of transaction calcuated successfully"
            }
        } catch (error) {
            console.error("Failed to count transactions",error)
            return {success:false, message: "Failed to count transactions"}
        }
    }
}