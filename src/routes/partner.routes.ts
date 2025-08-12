import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { TimeSlotController } from '../controllers/time-slot/time-slot.controller'
import { IAdminController } from '../controllers/admin/admin.controller.interface'
import { authMiddleware } from '../middlewares/auth.middleware'


@injectable()
export class PartnerRoutes {
    private router : Router
    constructor(
        @inject(TYPES.IAdminController) private _adminController : IAdminController,
        @inject(TYPES.ITimeSlotController) private _timeSlotController : TimeSlotController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.use(authMiddleware);
        this.router.patch('/partner/:id/location',this._adminController.updateUser.bind(this._adminController))
        this.router.post('/block-slot', this._timeSlotController.blockSlot.bind(this._timeSlotController));
        this.router.get('/available-slots', this._timeSlotController.getAvailableSlots.bind(this._timeSlotController));
        this.router.delete('/unblock-slot/:technicianId/:googleEventId', this._timeSlotController.unblockSlot.bind(this._timeSlotController));
        this.router.post('/block-multi-day-slots', this._timeSlotController.blockMultiDaySlots.bind(this._timeSlotController));
    }

    public getRouter(){
        return this.router
    }
}