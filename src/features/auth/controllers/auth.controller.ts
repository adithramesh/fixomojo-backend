import { inject, injectable } from "inversify";
import { TYPES } from "../../../types/types";
import { IAuthController } from "./auth.controller.interface";
import { AuthService } from "../services/auth.services";
import { SignupResponseDTO, SignupUserRequestDTO } from "../dto/signup.dto";
import { Request, Response } from "express";
import { OtpRequestDTO, OtpResendRequestDTO } from "../dto/otp-verify.dto";
import { LoginRequestDTO } from "../dto/login.dto";
import { ForgotPasswordRequestDTO, ResetPasswordRequestDTO } from "../dto/password.dto";
import { HttpStatus } from "../../../utils/http-status.enum";

@injectable()
export class AuthController implements IAuthController {
constructor(
        @inject(TYPES.AuthService) private _authService:AuthService
    ){}

    async signup(req: Request<SignupUserRequestDTO>, res:Response<SignupResponseDTO>):Promise<void>{
        try {
            const signupData:SignupUserRequestDTO=req.body
            const response= await this._authService.signup(signupData)
            res.status(response.status).json(response)
        } catch (error) {
            console.log("error occured", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: "Internal server error",
                status: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }

    async verifyOtp(req: Request<OtpRequestDTO & { context: "signup" | "forgot-password" }>, res:Response<SignupResponseDTO>):Promise<void>{
        console.log('Received verify-otp request:', req.body);
        try {
            const {tempUserId, otp, context}=req.body
            const response= await this._authService.verifyOtp({tempUserId,otp,context})
            res.status(response.status).json(response)
        } catch (error) {
            console.log("error occured", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: "Internal server error",
                status: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }

    async resendOtp(req: Request<OtpResendRequestDTO>,res:Response<SignupResponseDTO>):Promise<void>{
        try {
            const otpData:OtpResendRequestDTO=req.body
            const response = await this._authService.resendOtp(otpData)
            console.log("response resend otp",response);
            res.status(response.status).json(response)
        } catch (error) {
            console.log("error occured", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: "Internal server error",
                status: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }

    async login(req:Request<LoginRequestDTO>,res:Response<SignupResponseDTO>):Promise<void>{
        try {
            const loginData:LoginRequestDTO=req.body
            const response = await this._authService.login(loginData)
            console.log(response);
            
            res.status(response.status).json(response)
        } catch (error) {
            console.log("error occured", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: "Internal server error",
                status: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }

    async forgotPassword(req:Request<ForgotPasswordRequestDTO>, res:Response<SignupResponseDTO>):Promise<void>{
        try {
            const data:ForgotPasswordRequestDTO = req.body
            // console.log("forgot password controller", data);
            const response = await this._authService.forgotPassword(data)
            res.status(response.status).json(response)
        } catch (error) {
            console.log("error occured", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: "Internal server error",
                status: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }

    async resetPassword(req:Request<ResetPasswordRequestDTO>,res:Response<SignupResponseDTO>):Promise<void>{
        try {
            const resetData:ResetPasswordRequestDTO=req.body;
            const response = await this._authService.resetPassword(resetData)
            console.log("response from reset password", response);
            res.status(response.status).json(response)
        } catch (error) {
            console.log("error occured", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: "Internal server error",
                status: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }
    }
}


