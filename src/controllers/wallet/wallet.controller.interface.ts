import { Response} from "express"
import { AuthRequest } from "../../middlewares/auth.middleware"

export interface IWalletController {
    getWallet(req:AuthRequest,res:Response):Promise<void>
    walletRecharge(req:AuthRequest, res:Response):Promise<void>
    walletRechargeConfirm(req:AuthRequest, res:Response):Promise<void>
    // credit(req:Request,res:Response):Promise<void>
}