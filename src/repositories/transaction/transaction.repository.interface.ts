import { ITransaction } from "../../models/transaction.model"

export interface ITransactionRepository{
    logTransaction(data:Partial<ITransaction>):Promise<ITransaction>
    getTransactionByUser(userId:string):Promise<ITransaction | null>
}