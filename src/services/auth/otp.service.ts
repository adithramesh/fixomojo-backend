import { injectable } from "inversify";
export interface IOtpService{
    generateOtp():string;
    // verifyOtp(userId:string, otp:string):Boolean
}
@injectable()
export class OtpService implements IOtpService{
    generateOtp(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
}