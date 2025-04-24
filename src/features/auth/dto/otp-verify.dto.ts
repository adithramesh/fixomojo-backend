export interface OtpRequestDTO{
    tempUserId:string
    otp:string
    context?: "signup" | "forgot-password"
}

export interface OtpResendRequestDTO{
    tempUserId:string
    phoneNumber:string
    context?:"signup" | "forgot-password"
}