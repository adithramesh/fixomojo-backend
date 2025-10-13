import { Role } from "../models/user.model";
import { HttpStatus } from "../utils/http-status.enum";

export interface SignupUserRequestDTO {
    username: string;
    email: string;
    phoneNumber: string; 
    password: string;
    role?: Role
    serviceType?: string; 
    adminCode?: string; 
    department?: string; 
    phoneVerified?:boolean
}


export interface SignupResponseDTO {
    success: boolean;
    data?: {
        id: string; 
        username:string;
        email: string;
        phoneNumber:string;
        role: Role;
    };
    message: string;
    tempUserId?:string;
    access_token?: string;
    refresh_token?: string;
    reset_token?:string;
    context?:"signup" | "forgot-password";
    status: HttpStatus;
}