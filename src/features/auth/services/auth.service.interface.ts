import { OtpRequestDTO } from "../dto/otp-verify.dto";
import { SignupResponseDTO, SignupUserRequestDTO } from "../dto/signup.dto";

export interface IAuthService{
    signup(signUpData:SignupUserRequestDTO):Promise<any>;
    verifyOtp(otp:OtpRequestDTO):Promise<SignupResponseDTO>
}