import Otp,{ IOtp } from "../../models/otp.model";
import { IOtpRepository } from "./otp.repository.interface";
import { injectable } from "inversify";

@injectable()
export class OtpRepository implements IOtpRepository {
    async createOtp(otpData: Partial<IOtp>): Promise<IOtp> {
        await Otp.deleteMany({ userId: otpData.userId });
        const result = await Otp.create(otpData);
        if (!result) {
            throw new Error("Failed to create OTP");
        }
        return result as IOtp
    }
    async findOtpByUserId(userId: string): Promise<IOtp | null> {
        return await Otp.findOne({userId, expiresAt:{$gt: new Date()}}).sort({ expiresAt: -1 });
    }

    async findOtpByUserIdWithoutExpiry(userId: string): Promise<IOtp | null> {
        return await Otp.findOne({ userId }).sort({ createdAt: -1 }); 
    }
    async deleteOtp(id: string): Promise<void> {
        await Otp.findByIdAndDelete(id)
    }
}