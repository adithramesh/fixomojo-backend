import Otp,{ IOtp } from "../models/otp.model";
import { IOtpRepository } from "./otp.repository.interface";

export class OtpRepository implements IOtpRepository{
    async createOtp(otpData: Partial<IOtp>): Promise<IOtp> {
        return Otp.create(otpData);
    }
    async findOtp(userId: string, otp: string): Promise<IOtp | null> {
        return Otp.findOne({userId,otp, expiresAt:{$gt: new Date()}})
    }
    async deleteOtp(id: string): Promise<void> {
        await Otp.deleteOne({_id:id})
    }

}