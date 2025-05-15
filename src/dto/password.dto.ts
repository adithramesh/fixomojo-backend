export interface ForgotPasswordRequestDTO {
    phoneNumber:string
}

export interface ResetPasswordRequestDTO {
    tempUserId:string,
    reset_token:string,
    newPassword:string
}