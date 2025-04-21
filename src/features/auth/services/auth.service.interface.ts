import { LoginRequestDTO } from "../dto/login.dto";
import { OtpRequestDTO } from "../dto/otp-verify.dto";
import { ForgotPasswordRequestDTO } from "../dto/password.dto";
import { SignupResponseDTO, SignupUserRequestDTO } from "../dto/signup.dto";

export interface IAuthService{
    signup(signUpData:SignupUserRequestDTO):Promise<SignupResponseDTO>;
    verifyOtp(otp:OtpRequestDTO, context:string):Promise<SignupResponseDTO>
    login(loginData:LoginRequestDTO):Promise<SignupResponseDTO>
    forgotPassword(data:ForgotPasswordRequestDTO):Promise<SignupResponseDTO>
}