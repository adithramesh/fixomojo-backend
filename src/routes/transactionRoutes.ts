import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'
import { TransactionController } from '../controllers/transaction/transaction.controller'

@injectable()
export class TransactionRoutes {
    private router : Router
    constructor(
        @inject(TYPES.TransactionController) private _transactionController : TransactionController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.use(authMiddleware);
        this.router.post('/log',this._transactionController.logTransaction.bind(this._transactionController))
        this.router.get('/user-transactions',this._transactionController.getTransactionByUser.bind(this._transactionController))
        this.router.get('/count',this._transactionController.countTransactions.bind(this._transactionController))
    }
    public getRouter(){
        return this.router
    }
}

