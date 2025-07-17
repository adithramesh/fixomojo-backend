import { IOtp } from "../../models/otp.model";

export interface IOtpRepository{
    createOtp(otpData: Partial<IOtp>):Promise<IOtp>;
    findOtpByUserId(userId:string):Promise<IOtp|null>
    findOtpByUserIdWithoutExpiry(userId: string): Promise<IOtp | null>
    deleteOtp(id: string): Promise<void>
}