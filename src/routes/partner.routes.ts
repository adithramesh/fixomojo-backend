import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { AdminController } from '../controllers/admin/admin.controller'
import { TimeSlotController } from '../controllers/time-slot/time-slot.controller'


@injectable()
export class PartnerRoutes {
    private router : Router
    constructor(
        @inject(TYPES.AdminController) private _adminController : AdminController,
        @inject(TYPES.TimeSlotController) private _timeSlotController : TimeSlotController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
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