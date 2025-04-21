import { injectable } from "inversify";
interface IOtp{
    generateOtp():string;
    // verifyOtp(userId:string, otp:string):Boolean
}
@injectable()
export class OtpService implements IOtp{
    generateOtp(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
}