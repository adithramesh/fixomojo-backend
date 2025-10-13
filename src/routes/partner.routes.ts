import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { IAdminController } from '../controllers/admin/admin.controller.interface'
import { authMiddleware } from '../middlewares/auth.middleware'
import { IUserController } from '../controllers/users/user.controller.interface'
import { ITimeSlotController } from '../controllers/time-slot/time-slot.controller.interface'
import { Role } from '../models/user.model'


@injectable()
export class PartnerRoutes {
    private router : Router
    constructor(
        @inject(TYPES.IAdminController) private _adminController : IAdminController,
        @inject(TYPES.ITimeSlotController) private _timeSlotController : ITimeSlotController,
        @inject(TYPES.IUserController) private _userController : IUserController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.patch('/partner/:id/location',authMiddleware([Role.PARTNER]),this._adminController.updateUser.bind(this._adminController))
        this.router.post('/block-slot',authMiddleware(), this._timeSlotController.blockSlot.bind(this._timeSlotController));
        this.router.get('/available-slots',authMiddleware(), this._timeSlotController.getAvailableSlots.bind(this._timeSlotController));
        this.router.delete('/unblock-slot/:technicianId/:googleEventId',authMiddleware(), this._timeSlotController.unblockSlot.bind(this._timeSlotController));
        this.router.post('/block-multi-day-slots',authMiddleware(), this._timeSlotController.blockMultiDaySlots.bind(this._timeSlotController));
        this.router.get('/dashboard',authMiddleware([Role.PARTNER]), this._userController.getPartnerDashboard.bind(this._userController))
    }

    public getRouter(){
        return this.router
    }
}