import {Request, Response} from "express"

export interface ITimeSlotController {
    blockSlot(req:Request,res:Response):Promise<void>
    getAvailableSlots(req:Request,res:Response):Promise<void>
    blockMultiDaySlots(req: Request, res: Response): Promise<void>
    unblockSlot(req: Request, res: Response): Promise<void>
}