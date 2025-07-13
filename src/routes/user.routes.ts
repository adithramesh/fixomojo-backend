import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { UserController } from '../controllers/users/user.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

@injectable()
export class UserRoutes {
    private router : Router
    constructor(
        @inject(TYPES.UserController) private _userController : UserController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.use(authMiddleware);
        this.router.get('/home',this._userController.getHome.bind(this._userController))
        this.router.post('/book-service',this._userController.bookService.bind(this._userController))
        this.router.get('/verify-payment',this._userController.verifyPayment.bind(this._userController))
    }
    public getRouter(){
        return this.router
    }
}

