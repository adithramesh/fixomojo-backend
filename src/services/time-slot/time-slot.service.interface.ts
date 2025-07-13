import { BlockSlotDTO,AvailableSlotsDTO, MultiDayBlockSlotDTO } from "../../dto/time-slot.dto"

export interface BackendTimeSlot {
    start: string; // ISO string
    end: string;   // ISO string
    type: 'available' | 'customer-booked' | 'technician-blocked';
    isAvailable: boolean;
    isEditable: boolean;
    id?: string; // This will be the Google Calendar event ID
    reason?: string; // Reason for blocking, if technician-blocked or custom booking summary
}

export interface ITimeSlotService {
    blockSlot(data:BlockSlotDTO):Promise<{ success: boolean; message: string; eventId?: string|null }>
    blockMultiDaySlots(data: MultiDayBlockSlotDTO): Promise<{ success: boolean; message: string }>;
    // getAvailableSlots(data:AvailableSlotsDTO):Promise<{ start: Date; end: Date }[]>
    getAvailableSlots(data: AvailableSlotsDTO): Promise<{ success: boolean; slots: BackendTimeSlot[] }>;
}