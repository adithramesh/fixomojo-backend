import { IWallet } from "../../models/wallet.model";

export interface IWalletRepository {
    createWallet(userId: string, role:  "partner" | "admin" | "user" | undefined, amount: number, referenceId?:string): Promise<IWallet> 
    findWalletByUserId(userId: string): Promise<IWallet | null> 
    updateBalance(userId: string, amount: number): Promise<IWallet | null>
}