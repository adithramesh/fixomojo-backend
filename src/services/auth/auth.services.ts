import { OtpRequestDTO, OtpResendRequestDTO } from "../../dto/otp-verify.dto";
import { SignupUserRequestDTO, SignupResponseDTO } from "../../dto/signup.dto";
import { IUser } from "../../models/user.model";
import { OtpRepository } from "../../repositories/otp/otp.repository";
import { UserRepository } from "../../repositories/user/user.repository";
import { TYPES } from "../../types/types";
import { IAuthService } from "./auth.service.interface";
import { OtpService } from "./otp.service";
import { PasswordService } from "./password.service";
import { injectable, inject } from "inversify";
// import twilio from "twilio";
import jwt from "jsonwebtoken";
import config from "../../config/env";
import mongoose from "mongoose";
import { LoginRequestDTO } from "../../dto/login.dto";
import { ForgotPasswordRequestDTO, ResetPasswordRequestDTO } from "../../dto/password.dto";
import { HttpStatus } from "../../utils/http-status.enum";
// const client =twilio(config.TWILIO_SID,config.TWILIO_AUTH_TOKEN)

@injectable()
export class AuthService implements IAuthService {

    constructor(
        @inject(TYPES.OtpRepository) private _otpRepository: OtpRepository,
        @inject(TYPES.OtpService) private _otpService: OtpService,
        @inject(TYPES.UserRepository) private _userRepository: UserRepository,
        @inject(TYPES.PasswordService) private _passwordService: PasswordService
    ) { }

    async signup(signUpData: SignupUserRequestDTO): Promise<SignupResponseDTO> {
        const { username, email, phoneNumber, role, password, serviceType, adminCode, department } = signUpData;
        const existingUser = await this._userRepository.findUserByPhone(email);
        if (existingUser) {
            return { success: false, message: "User already exists", status: HttpStatus.NOT_FOUND };
        }
        const existingPhone = await this._userRepository.findUserByPhone(phoneNumber);
        if (existingPhone) {
            return { success: false, message: "Phone number already exists", status: HttpStatus.BAD_REQUEST };
        }
        const hashedPassword = await this._passwordService.hash(password);
        const userModel: Partial<IUser> = {
            username,
            email,
            phoneNumber,
            password: hashedPassword, // Mongoose expects "password", not "passwordHash"
            role,
            serviceType,
            adminCode,
            department,
            phoneVerified: false,
        };
        const userId = await this._userRepository.createUser(userModel);
        console.log("user from repo", userId);
        
        const otp = this._otpService.generateOtp();
        console.log("otp", otp);
        
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this._otpRepository.createOtp({ userId, otp, expiresAt });
        
        // try {
        //     const verification = await client.verify.v2
        //         .services("VA91f25123daf1ace8064eb1105aa93e1c")
        //         .verifications.create({
        //             to: phoneNumber, // Use the dynamic phone number from signUpData
        //             channel: 'sms',
        //             customCode: otp,
        //         });
        //     console.log("OTP sent, status:", verification.status,"Custom code:", otp);
        // } catch (error) {
        //     console.error("Error sending OTP:",error);
        //     return { success: false, message: "Failed to send OTP", status: 500 };
        // }

        return {
            success: true,
            message: "User created, please verify OTP sent to your phone",
            tempUserId: userId,
            context: "signup",
            status: HttpStatus.SUCCESS,
        };
    }

    async verifyOtp(otpData: OtpRequestDTO): Promise<SignupResponseDTO> {
        const { tempUserId, otp, context } = otpData;
        const user = await this._userRepository.findUserById(tempUserId);
        if (!user) {
            return { success: false, message: "Invalid user", status: HttpStatus.NOT_FOUND };
        }

        const storedOtp = await this._otpRepository.findOtpByUserId(tempUserId);
        console.log("storedOtp", storedOtp);
        
        if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt! < new Date()) {
            return { success: false, message: "Invalid or expired OTP", status: HttpStatus.BAD_REQUEST };
        }

        const otpId = (storedOtp._id as mongoose.Types.ObjectId).toString();
        const userId = (user._id as mongoose.Types.ObjectId).toString();
        await this._otpRepository.deleteOtp(otpId);

        if (context === 'signup') {
            if (!user.phoneVerified) {
                await this._userRepository.updateUser(tempUserId, { phoneVerified: true });
            }
            const accessToken = jwt.sign(
                { id: userId, role: user.role },
                config.JWT_SECRET,
                { expiresIn: "15m" }
            );
            
            const refreshToken = jwt.sign(
                { id: userId },
                config.JWT_SECRET,
                { expiresIn: "7d" }
            );
            return {
                success: true,
                message: "Otp verified, user signed up successfully",
                access_token: accessToken,
                refresh_token: refreshToken,
                data: {
                    id: userId,
                    username: user.username,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                },
                status: HttpStatus.SUCCESS,
            };
        } else if (context === 'forgot-password') {
            console.log("inside verfy otp forgot password context", context);
            
            const resetToken = jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "10m" });
            return {
                success: true,
                message: "OTP verified, proceed to reset password",
                reset_token: resetToken,
                tempUserId: userId,
                status: HttpStatus.SUCCESS,
            };
        }
        throw new Error("Invalid context"); 
    }

    async resendOtp(data: OtpResendRequestDTO): Promise<SignupResponseDTO> {
        const { tempUserId, phoneNumber, context } = data;
        console.log("context", context);
        
        console.log("tempUserId, phoneNumber", tempUserId, phoneNumber);
        
        const user = await this._userRepository.findUserById(tempUserId);
        console.log("user", user);

        if (!user) {
            return { success: false, message: "Invalid user", status: HttpStatus.NOT_FOUND };
        }
        
        if (context === "signup" && user.phoneVerified) {
            return { success: false, message: "Invalid user or already verified", status: HttpStatus.FORBIDDEN };
        }

        const otp = this._otpService.generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this._otpRepository.createOtp({ userId: tempUserId, otp, expiresAt });
        console.log("otp", otp, phoneNumber);

        // try {
        //     const verification = await client.verify.v2
        //         .services("VA91f25123daf1ace8064eb1105aa93e1c")
        //         .verifications.create({
        //             to: phoneNumber, // Use the dynamic phone number from signUpData
        //             channel: 'sms',
        //         });
        //     console.log("OTP sent from resent otp, status:", verification.status);
        // } catch (error) {
        //     console.error("Error sending OTP:",error);
        //     return { success: false, message: "Failed to send OTP", status: 500 };
        // }

        return {
            success: true,
            message: "New OTP sent to your phone",
            tempUserId,
            status: HttpStatus.SUCCESS,
            context
        };
    }

    async login(loginData: LoginRequestDTO): Promise<SignupResponseDTO> {
        const { phoneNumber, password } = loginData;
        const user = await this._userRepository.findUserByPhone(phoneNumber);
        if (!user || !user.phoneVerified) {
            return { success: false, message: "Phone number not found or not verified", status: HttpStatus.NOT_FOUND };
        }
 
        const storedPassword = user.password;
        console.log("storedPassword", storedPassword);
        
        const isPasswordVerified = await this._passwordService.verifyPassword(password, storedPassword);
        console.log("isPasswordVerified", isPasswordVerified);
        
        if (!isPasswordVerified) {
            return { success: false, message: "Invalid password", status: HttpStatus.UNAUTHORIZED };
        }
        const userId = (user._id as mongoose.Types.ObjectId).toString();
        const accessToken = jwt.sign({ id: userId, role: user.role }, config.JWT_SECRET, { expiresIn: "1m" });
        const refreshToken = jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: "7d" });
        console.log("access_token",accessToken);
        
        return {
            success: true,
            message: "Login Successful",
            access_token: accessToken,
            refresh_token: refreshToken,
            data: { id: userId, username: user.username, email: user.email, phoneNumber: user.phoneNumber, role: user.role },
            status: HttpStatus.SUCCESS
        };
    }

    async forgotPassword(data: ForgotPasswordRequestDTO): Promise<SignupResponseDTO> {
        const { phoneNumber } = data;
        const user = await this._userRepository.findUserByPhone(phoneNumber);
        if (!user || !user.phoneVerified) {
            return { success: false, message: "Please enter verified phone number", status: 404 };
        }
        const userId = (user._id as mongoose.Types.ObjectId).toString();
        console.log("userId at forgot password", userId);
        const otp = this._otpService.generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this._otpRepository.createOtp({ userId, otp, expiresAt });
        console.log("otp & phone verified status", otp, user.phoneVerified);

   
        
        return {
            success: true,
            message: "Please do OTP verification for before resetting the password",
            tempUserId: userId,
            context: "forgot-password",
            status: HttpStatus.SUCCESS
        };
    }

    async resetPassword(resetData: ResetPasswordRequestDTO): Promise<SignupResponseDTO> {
        const { tempUserId, reset_token, newPassword } = resetData;
        // console.log("tempuserid 1", tempUserId);
        // console.log("newPassword", newPassword);
        try {
            jwt.verify(reset_token, config.JWT_SECRET);
            
            const hashedPassword = await this._passwordService.hash(newPassword);
            // console.log("hashedPassword",hashedPassword);
            // console.log("tempuserid 2", tempUserId);
            await this._userRepository.updateUser(tempUserId, { password: hashedPassword });
            
            return {
                success: true,
                message: "Password reset successful",
                status: HttpStatus.SUCCESS
            };
        } catch (error) {
            console.error("Password reset failed:", error);
        
            return {
                success: false,
                message: "Password reset failed. Please try again.",
                status: HttpStatus.INTERNAL_SERVER_ERROR || error
            };
        }
    }

    async refreshToken(refreshToken: string): Promise<SignupResponseDTO> {
        try {
            const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as { id: string };
            const userId = decoded.id;
            
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                return {
                    success: false,
                    message: "Invalid refresh token",
                    status: HttpStatus.UNAUTHORIZED
                };
            }
            
            const accessToken = jwt.sign(
                { id: userId, role: user.role },
                config.JWT_SECRET,
                { expiresIn: "15m" }
            );
            
            return {
                success: true,
                message: "Token refreshed successfully",
                access_token: accessToken,
                status: HttpStatus.SUCCESS
            };
        } catch (error) {
            console.error("Error refreshing token:", error);
            return {
                success: false,
                message: "Invalid or expired refresh token",
                status: HttpStatus.UNAUTHORIZED
            };
        }
    }
    
}