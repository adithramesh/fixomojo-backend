export interface BlockSlotDTO {
    technicianId?: string;
    bookingId:string;
    start: string; 
    end: string;   
    reason: string;
    isCustomerBooking?: boolean; 
}

export interface AvailableSlotsDTO {
    technicianId: string;
    date: string;
}

export interface MultiDayBlockSlotDTO {
    technicianId: string;
    startDate: string; 
    endDate: string;   
    reason: string;
}