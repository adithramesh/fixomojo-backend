import { BlockSlotDTO,AvailableSlotsDTO, MultiDayBlockSlotDTO } from "../../dto/time-slot.dto"

export interface BackendTimeSlot {
    start: string;
    end: string;   
    type: 'available' | 'customer-booked' | 'technician-blocked';
    isAvailable: boolean;
    isEditable: boolean;
    id?: string; 
    reason?: string; 
}

export interface ITimeSlotService {
    blockSlot(data:BlockSlotDTO):Promise<{ success: boolean; message: string; eventId?: string|null }>
    blockMultiDaySlots(data: MultiDayBlockSlotDTO): Promise<{ success: boolean; message: string }>;
    checkSlotAvailability(data: { technicianId: string; startTime: Date; endTime: Date }):Promise<{success: boolean; message: string}>
    unblockSlot(technicianId: string,googleEventId: string): Promise<{ success: boolean; message: string }> 
    getAvailableSlots(data: AvailableSlotsDTO): Promise<{ success: boolean; slots: BackendTimeSlot[] }>;
}