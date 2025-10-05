import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'
import { IBookingController } from '../controllers/booking/booking.controller.interface'
import { Role } from '../models/user.model'

@injectable()
export class BookingRoutes {
    private router : Router
    constructor(
        @inject(TYPES.IBookingController) private _bookingController : IBookingController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        // this.router.use(authMiddleware);
        this.router.get('/',authMiddleware([Role.USER, Role.PARTNER]),this._bookingController.bookings.bind(this._bookingController))
        this.router.get('/all',authMiddleware([Role.ADMIN]),this._bookingController.getAllBookingsForAdmin.bind(this._bookingController))
        // this.router.get('/count',this._bookingController.countBookings.bind(this._bookingController))
        this.router.get('/initiate-complete',authMiddleware([Role.PARTNER]),this._bookingController.initiateWorkComplete.bind(this._bookingController))
        this.router.get('/:bookingId',authMiddleware(),this._bookingController.getBookingById.bind(this._bookingController))
        this.router.post('/verify-work',authMiddleware([Role.PARTNER]), this._bookingController.verifyWorkComplete.bind(this._bookingController))
        this.router.post('/cancel/:id', authMiddleware([Role.USER, Role.PARTNER]), this._bookingController.cancelBooking.bind(this._bookingController))
    }
    public getRouter(){
        return this.router
    }
}

