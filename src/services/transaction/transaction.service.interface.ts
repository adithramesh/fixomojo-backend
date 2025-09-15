import { PaginationRequestDTO } from "../../dto/admin.dto";
import { TransactionRequestDTO, TransactionResponseDTO } from "../../dto/transaction.dto";
import { ITransaction } from "../../models/transaction.model";

export interface ITransactionService{
    logTransaction(data:TransactionRequestDTO ):Promise< {transaction?:Partial<ITransaction>,success:boolean, message:string}>
    getTransactionByUserPaginated(pagination: PaginationRequestDTO, userId:string):Promise<{ success: boolean; message: string; transactionList?: TransactionResponseDTO[] }>
    countTransaction(userId: string , filter:Record<string, unknown>):Promise<{count?:number,success:boolean, message:string}>
    getTransactionByReference(referenceId: string): Promise<TransactionResponseDTO | null>
}