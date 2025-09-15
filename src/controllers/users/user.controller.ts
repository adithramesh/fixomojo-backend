import { Request, Response } from "express";
import { HomeResponseDTO } from "../../dto/home.dto";
import { IUserController } from "./user.controller.interface"
import { inject, injectable } from "inversify";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";
import { AuthRequest } from '../../middlewares/auth.middleware';
import { IUserService } from "../../services/users/user.service.interface";
import { uploadToCloudinary } from "../../utils/cloudinary.uploader";
import { PartnerDashboardResponseDTO } from "../../dto/partner.dto";

@injectable()
export class UserController implements IUserController{
    constructor(
        @inject(TYPES.IUserService) private _userService:IUserService
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

    async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId=req.user?.id.toString()|| ''
            const response = await this._userService.getProfile(userId)
            res.status(HttpStatus.SUCCESS).json(response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
            console.error("Error in get users profile", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to get users profile" });
        }
    }

    async updateProfile(req: AuthRequest, res: Response): Promise<void> {
           try {
              const userId=req.user?.id.toString()|| ''
              const userData = req.body
               if (req.file) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const uploadResult:any = await uploadToCloudinary(req.file.buffer, 'users');
                userData.image = uploadResult.public_id;
              }
              const response = await this._userService.updateProfile(userId, userData)
              res.status(HttpStatus.SUCCESS).json(response);
            } catch (error) {
              console.log("error occured", error);
              res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            }
    }

    async getPartnerDashboard(req: AuthRequest, res: Response<PartnerDashboardResponseDTO>): Promise<void> {
        try {
          const userId = req.user?.id.toString() ||""
          const response = await this._userService.getPartnerDashboard(userId)
          res.status(HttpStatus.SUCCESS).json(response)
        } catch (error) {
          console.log("error occured", error);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        }
      }
}