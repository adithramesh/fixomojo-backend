interface IOtp{
    generateOtp():String;
    // verifyOtp(userId:string, otp:string):Boolean
}

export class OtpService implements IOtp{
    generateOtp(): String {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    // verifyOtp(userId:string, otp:string): Boolean {

    //     return true
    // }
    
}