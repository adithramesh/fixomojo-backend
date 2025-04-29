import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { UserController } from '../features/users/controllers/user.controller'

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
        this.router.get('/home',this._userController.getHome.bind(this._userController))
    }

    public getRouter(){
        return this.router
    }
}