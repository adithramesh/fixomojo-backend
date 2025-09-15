
export interface TransactionRequestDTO {
    userId:string; 
    bookingId?:string; 
    amount:number; 
    transactionType?:string
    purpose?: string;
    referenceId?: string;
    role?: string;
} 

export interface TransactionResponseDTO {
    id?:string;
    userId: string;
    amount: number;
    transactionType: string;
    purpose?: string;
    referenceId?: string;
    role: string;
} 