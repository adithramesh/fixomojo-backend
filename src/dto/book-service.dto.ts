export interface BookServiceRequestDTO {
    userId: string, 
    technicianId:string,
    subServiceId:string,
    location: {
    address: string;
    latitude: number;
    longitude: number;
    };
    date:Date,
    totalAmount:number,
    paymentMethod:"Cash" | "Card" | "Wallet"
    timeSlotStart:Date
    timeSlotEnd:Date
    bookingStatus?:"Hold" |"Pending" | "Confirmed" | "Cancelled"| "Completed" | "Failed";
}


export interface BookServiceResponseDTO {
    success?:boolean,
    message?:string,
    data?:object
}

export interface BookingResponseDTO {
    id?: string;
    username?: string;
    subServiceId: string;
    subServiceName: string;
    totalAmount: string | number;
    paymentStatus: string;
    bookingStatus: string;
    timeSlotStart?: Date | null;
    createdAt: Date;
    location: string | {address:string, latitude:number, longitude:number};
    isCompleted?: boolean;
}



  