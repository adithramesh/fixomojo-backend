import { PaginationRequestDTO } from "../../dto/admin.dto";
import { ITransaction } from "../../models/transaction.model";

export interface ITransactionService{
    logTransaction(data:Partial<ITransaction>):Promise< {transaction?:Partial<ITransaction>,success:boolean, message:string}>
    getTransactionByUserPaginated(pagination: PaginationRequestDTO, userId:string):Promise<{ success: boolean; message: string; transactionList?: Partial<ITransaction[]> }>
    countTransaction(userId: string):Promise<{count?:number,success:boolean, message:string}>
    getTransactionByReference(referenceId: string): Promise<ITransaction | null>
}