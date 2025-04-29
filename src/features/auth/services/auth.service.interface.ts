import { LoginRequestDTO } from "../dto/login.dto";
import { OtpRequestDTO, OtpResendRequestDTO } from "../dto/otp-verify.dto";
import { ForgotPasswordRequestDTO, ResetPasswordRequestDTO } from "../dto/password.dto";
import { SignupResponseDTO, SignupUserRequestDTO } from "../dto/signup.dto";

export interface IAuthService{
    signup(signUpData:SignupUserRequestDTO):Promise<SignupResponseDTO>;
    verifyOtp(otpData: OtpRequestDTO): Promise<SignupResponseDTO>
    resendOtp(data:OtpResendRequestDTO):Promise<SignupResponseDTO>
    login(loginData:LoginRequestDTO):Promise<SignupResponseDTO>
    forgotPassword(data:ForgotPasswordRequestDTO):Promise<SignupResponseDTO>
    resetPassword(resetData: ResetPasswordRequestDTO): Promise<SignupResponseDTO>
    
    
}