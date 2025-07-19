import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'
// import { BookingController } from '../controllers/booking/booking.controller'
import { IBookingController } from '../controllers/booking/booking.controller.interface'

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
        this.router.use(authMiddleware);
        this.router.get('/',this._bookingController.bookings.bind(this._bookingController))
        this.router.get('/all',this._bookingController.getAllBookingsForAdmin.bind(this._bookingController))
        // this.router.get('/count',this._bookingController.countBookings.bind(this._bookingController))
        this.router.get('/initiate-complete',this._bookingController.initiateWorkComplete.bind(this._bookingController))
        this.router.get('/:bookingId',this._bookingController.getBookingById.bind(this._bookingController))
        this.router.post('/verify-work',this._bookingController.verifyWorkComplete.bind(this._bookingController))
    }
    public getRouter(){
        return this.router
    }
}

