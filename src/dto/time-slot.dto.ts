export interface BlockSlotDTO {
    technicianId: string;
    start: Date;
    end: Date;
    reason: string;
}

export interface AvailableSlotsDTO {
    technicianId: string;
    date: Date; // Date to check availability for
}