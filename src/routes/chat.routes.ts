import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'
import { IChatController } from '../controllers/chat/chat.controller.interface'
import { Role } from '../models/user.model'



@injectable()
export class ChatRoutes {
    private router : Router
    constructor(
        @inject(TYPES.IChatController) private _chatController : IChatController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){

        this.router.get('/:bookingId',authMiddleware([Role.USER, Role.PARTNER]),this._chatController.getChatHistory.bind(this._chatController))
       
    }
    public getRouter(){
        return this.router
    }
}

