import { IWallet } from "../../models/wallet.model"

export interface IWalletService {
    credit(userId:string, share:number, role:"partner" | "admin" | "user" | undefined, purpose?:string, referenceId?:string):Promise<{success:boolean, message:string,wallet?:IWallet}>
    getWallet(userId:string, referenceId:string):Promise<{success:boolean, message:string,wallet?:IWallet}>
    walletRecharge(userId:string, amount:number):Promise<{success:boolean, checkoutUrl?:string, message:string}>
    walletRechargeConfirm(sessionId:string):Promise<{success:boolean, message:string}>
}