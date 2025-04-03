import { IUser } from "../models/user.model";

export interface SignupUserRequestDTO {
    username: string;
    email: string;
    password: string;
    phone: number;
    status: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface SignupResponseDTO {
    success: boolean;
    data?: IUser;
    message: string;
    access_token?: string;
    refresh_token?: string;
    status: number;
}