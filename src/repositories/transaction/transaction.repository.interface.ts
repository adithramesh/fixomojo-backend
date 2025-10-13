import { FilterQuery } from "mongoose"
import { ITransaction } from "../../models/transaction.model"

export interface ITransactionRepository{
    logTransaction(data:Partial<ITransaction>):Promise<ITransaction>
    getTransactionByUser(userId:string):Promise<ITransaction | null>
    findTransactionsPaginated(skip: number,limit: number,sortBy: string,sortOrder: string,filter:  FilterQuery<ITransaction>):Promise<ITransaction[]>
    countTransactions(userId: string, filter: Record<string, unknown>) :Promise<number>
    getTransactionByReference(referenceId: string): Promise<ITransaction | null>
}