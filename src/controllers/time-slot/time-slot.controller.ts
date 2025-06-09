import { Request, Response } from "express";
import { ITimeSlotController } from "./time-slot.controller.interface";
import { TYPES } from "../../types/types";
import { inject, injectable } from "inversify";
import { TimeSlotService } from "../../services/time-slot/time-slot.service";
import { HttpStatus } from "../../utils/http-status.enum";

@injectable()
export class TimeSlotController implements ITimeSlotController {

    constructor(
        @inject(TYPES.TimeSlotService) private _timeSlotService: TimeSlotService
      ) {}

    async blockSlot(req: Request, res: Response): Promise<void> {
        try {
            const { technicianId, start, end, reason }= req.body
        const result = await this._timeSlotService.blockSlot({technicianId,start:new Date(start), end: new Date(end), reason})
        res.status(HttpStatus.CREATED).json(result)
        } catch (error) {
            res.status(400).json({ success: false, message: error });
        }
    }

    async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
        const { technicianId, date } = req.query;
        console.log("req.query", req.query);
        
        
        const slots = await this._timeSlotService.getAvailableSlots({ 
            technicianId: String(technicianId || ''), 
            date: new Date(String(date || '')) 
        });
        
        res.status(HttpStatus.SUCCESS).json({ success: true, slots });
    } catch (error) {
        res.status(400).json({ success: false, message: error });
    } 
}

   
}