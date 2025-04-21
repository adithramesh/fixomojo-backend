import {Request, Response} from "express"
import { SignupResponseDTO, SignupUserRequestDTO } from "../dto/signup.dto"
import { LoginRequestDTO } from "../dto/login.dto"
import { ForgotPasswordRequestDTO, ResetPasswordRequestDTO } from "../dto/password.dto"
import { OtpRequestDTO, OtpResendRequestDTO } from "../dto/otp-verify.dto"
export interface IAuthController {
    signup(req: Request<SignupUserRequestDTO>, res: Response<SignupResponseDTO>): Promise<void>
    verifyOtp(req: Request<OtpRequestDTO>, res: Response<SignupResponseDTO>):Promise<void>
    resendOtp(req: Request<OtpResendRequestDTO>, res: Response<SignupResponseDTO>):Promise<void>
    login(req: Request<LoginRequestDTO>, res: Response<SignupResponseDTO>):Promise<void>
    forgotPassword(req: Request<ForgotPasswordRequestDTO>, res: Response<SignupResponseDTO>):Promise<void>
    resetPassword(req: Request<ResetPasswordRequestDTO>, res: Response<SignupResponseDTO>):Promise<void>
}