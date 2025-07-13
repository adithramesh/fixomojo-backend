import { inject, injectable } from "inversify";
import { IWalletController } from "./wallet.controller.interface";
import { Response } from "express";
import { WalletService } from "../../services/wallet/wallet.service";
import { TYPES } from "../../types/types";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { HttpStatus } from "../../utils/http-status.enum";

@injectable()
export class WalletController implements IWalletController{
    constructor(
        @inject(TYPES.WalletService) private _walletService: WalletService
    ){}

    async getWallet(req: AuthRequest, res: Response): Promise<void> {
       try {
            const userId = req.user?.id.toString() || ''
            // const role = req.user?.role
            // const referenceId  = req.query.referenceId
            const wallet= await this._walletService.getWallet(userId)
            res.status(HttpStatus.SUCCESS).json(wallet)
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       } catch (error:any) {
            console.error("Error fetching wallet:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Error fetching wallet" });
        }
    }

        async walletRecharge(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId =req.user?.id || ''
            const {amount}= req.body
            const result = await this._walletService.walletRecharge(userId,amount)
            res.status(HttpStatus.CREATED).json(result)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error in walletrecharge controller:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to card payment/bookservice" });
        }
    }

    async walletRechargeConfirm(req: AuthRequest, res: Response): Promise<void> {
        try {
         const sessionId=req.query.session_id as string
         const response = await this._walletService.walletRechargeConfirm(sessionId)
         res.status(HttpStatus.SUCCESS).json(response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error in card wallet recharge controller:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message  });
        }
    }


}