import { BlockSlotDTO,AvailableSlotsDTO } from "../../dto/time-slot.dto"

export interface ITimeSlotService {
    blockSlot(data:BlockSlotDTO):Promise<{ success: boolean; message: string; eventId?: string|null }>
    getAvailableSlots(data:AvailableSlotsDTO):Promise<{ start: Date; end: Date }[]>
}