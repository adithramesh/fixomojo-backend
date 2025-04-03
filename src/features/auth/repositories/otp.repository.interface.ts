import { IOtp } from "../models/otp.model";

export interface IOtpRepository{
    createOtp(otpData: Partial<IOtp>):Promise<IOtp>;
    findOtp(userId:string,otp:string):Promise<IOtp|null>
    deleteOtp(id: string): Promise<void>
}