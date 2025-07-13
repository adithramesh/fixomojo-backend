import { Request, Response } from "express";
import { HomeResponseDTO } from "../../dto/home.dto";
import { IUserController } from "./user.controller.interface"
import { inject, injectable } from "inversify";
import { UserService } from "../../services/users/user.service";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";
import { AuthRequest } from '../../middlewares/auth.middleware';

@injectable()
export class UserController implements IUserController{
    constructor(
        @inject(TYPES.UserService) private _userService:UserService
    ){}
    async getHome( req: Request,res: Response<HomeResponseDTO>): Promise<void> {
        const searchTerm = req.query.searchTerm as string
        const response = await this._userService.getHome(searchTerm)
        res.status(HttpStatus.SUCCESS).json(response)
    }

    async bookService(req: Request, res: Response):Promise<void> {
        try {
          const {userId, username, technicianId, subServiceId, location, date, totalAmount, paymentMethod, timeSlotStart, timeSlotEnd, subServiceName }=req.body      
      

      if (!userId ||!technicianId || !subServiceId || !location  || !date || !totalAmount || !paymentMethod || !timeSlotStart || !timeSlotEnd || !subServiceName ) {
        res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "userId, technicianId, subServiceId, location, date, totalAmount, paymentMethod,  timeSlotStart, timeSlotEnd, subServiceNameare required."
                    });
        return;
      }
       const data={userId, username, technicianId, subServiceId, location, date, totalAmount, paymentMethod, timeSlotStart, timeSlotEnd, subServiceName}

      const response = await this._userService.bookService(data)
      res.status(HttpStatus.CREATED).json(response);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error in bookservicer controller layer:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to card payment/bookservice" });
        }
    }

    async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const sessionId=req.query.session_id as string
            const userId=req.user?.id.toString()|| ''
            const response = await this._userService.verifyPayment(sessionId,userId)
            res.status(HttpStatus.SUCCESS).json(response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error in card payment/bookservicer:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to card payment/bookservice" });
        }
    }

}