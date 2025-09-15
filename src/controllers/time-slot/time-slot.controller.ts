import { Request, Response } from "express";
import { ITimeSlotController } from "./time-slot.controller.interface";
import { TYPES } from "../../types/types";
import { inject, injectable } from "inversify";
import { HttpStatus } from "../../utils/http-status.enum";
import { ITimeSlotService } from "../../services/time-slot/time-slot.service.interface";

@injectable()
export class TimeSlotController implements ITimeSlotController {

    constructor(
        @inject(TYPES.ITimeSlotService) private _timeSlotService: ITimeSlotService
      ) {}

    async checkAvailabilty(req: Request, res: Response): Promise<void>{
        try {
           const {technicianId, startTime, endTime}= req.body
           const data = {technicianId, startTime, endTime}
           const result = await this._timeSlotService.checkSlotAvailability(data)
           res.status(HttpStatus.SUCCESS).json(result)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error to check avaibilty for lock purpose:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to do lock operation controller " });
        }
    }
    async blockSlot(req: Request, res: Response): Promise<void> {
        try {
        const { technicianId, start, end, reason, isCustomerBooking, bookingId }= req.body
        const result = await this._timeSlotService.blockSlot({technicianId,start, end, reason, isCustomerBooking, bookingId})
        res.status(HttpStatus.CREATED).json(result)
        } catch (error) {
            res.status(400).json({ success: false, message: error });
        }
    }

    async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
        const { technicianId, date } = req.query;        
        const slots = await this._timeSlotService.getAvailableSlots({ 
            technicianId: String(technicianId || ''), 
            date: (String(date || '')) 
        });
        
        res.status(HttpStatus.SUCCESS).json(slots);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to retrieve available slots" });
    }
    }

async blockMultiDaySlots(req: Request, res: Response): Promise<void> {
        try {
            const { technicianId, startDate, endDate, reason } = req.body;

            if (!technicianId || !startDate || !endDate || !reason) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Technician ID, start date, end date, and reason are required."
                });
                return;
            }

            const result = await this._timeSlotService.blockMultiDaySlots({
                technicianId,
                startDate,
                endDate,
                reason
            });

            res.status(HttpStatus.CREATED).json(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error in blockMultiDaySlots controller:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to block multiple days" });
        }
    }
    
 async unblockSlot(req: Request, res: Response): Promise<void> {
        try {
            const { technicianId, googleEventId } = req.params;
            
            if (!technicianId || !googleEventId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Technician ID and Google Event ID are required."
                });
                return;
            }
            const result = await this._timeSlotService.unblockSlot(String(technicianId), String(googleEventId));
            res.status(HttpStatus.CREATED).json(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error in unblockSlot controller:", error);
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to unblock slot" });
        }
    }
   
}