// export interface BlockSlotDTO {
//     technicianId: string;
//     start: Date;
//     end: Date;
//     reason: string;
// }

// export interface AvailableSlotsDTO {
//     technicianId: string;
//     date: Date; // Date to check availability for
// }

export interface BlockSlotDTO {
    technicianId?: string;
    bookingId:string;
    start: string; // Changed to string (ISO format) for consistency
    end: string;   // Changed to string (ISO format) for consistency
    reason: string;
    isCustomerBooking?: boolean; // New: to differentiate customer bookings from technician blocks
}

export interface AvailableSlotsDTO {
    technicianId: string;
    date: string; // Changed to string (ISO date string YYYY-MM-DD)
}

export interface MultiDayBlockSlotDTO {
    technicianId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    reason: string;
}