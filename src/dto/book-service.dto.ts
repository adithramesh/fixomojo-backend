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
    message:string,
    data?:object
}