import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'
import { ITimeSlotController } from '../controllers/time-slot/time-slot.controller.interface'
import { IUserController } from '../controllers/users/user.controller.interface'

@injectable()
export class UserRoutes {
    private router : Router
    constructor(
        @inject(TYPES.IUserController) private _userController : IUserController,
        @inject(TYPES.ITimeSlotController) private _timeSlotController : ITimeSlotController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.use(authMiddleware);
        this.router.get('/home',this._userController.getHome.bind(this._userController))
        this.router.post('/timeslot/check-availability', this._timeSlotController.checkAvailabilty.bind(this._timeSlotController))
        this.router.post('/book-service',this._userController.bookService.bind(this._userController))
        this.router.get('/verify-payment',this._userController.verifyPayment.bind(this._userController))
    }
    public getRouter(){
        return this.router
    }
}

