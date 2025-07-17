import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'
import { IWalletController } from '../controllers/wallet/wallet.controller.interface'


@injectable()
export class WalletRoutes {
    private router : Router
    constructor(
        @inject(TYPES.IWalletController) private _walletController : IWalletController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.use(authMiddleware);
        this.router.get('/balance',this._walletController.getWallet.bind(this._walletController))
        this.router.post('/recharge',this._walletController.walletRecharge.bind(this._walletController))
        this.router.get('/confirm-wallet', this._walletController.walletRechargeConfirm.bind(this._walletController))
    }
    public getRouter(){
        return this.router
    }
}

