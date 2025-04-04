import { database } from "../../../config/database";
import { OtpRequestDTO } from "../dto/otp-verify.dto";
import { SignupUserRequestDTO, SignupResponseDTO } from "../dto/signup.dto";
import { OtpRepository } from "../repositories/otp.repository";
import { UserRepository } from "../repositories/user.repository";
import { IAuthService } from "./auth.service.interface";
import { OtpService } from "./otp.service";
import { PasswordService } from "./password.service";

export class authService implements IAuthService{
    private _userRepository:UserRepository
    private _otpRepository:OtpRepository
    private _passwordService:PasswordService
    private _otpService:OtpService
    constructor(){
        this._userRepository=new UserRepository()
        this._otpRepository=new OtpRepository()
        this._passwordService=new PasswordService()
        this._otpService=new OtpService()
    }
    async signup(signUpData: SignupUserRequestDTO): Promise<any> {
        const {email, password}= signUpData
        const existingUser = await this._userRepository.findUserByEmail(email)
        if(existingUser){
            return {message:"User already exists", status:404}
        }

        const hashedPassword=await this._passwordService.hash(password)
        const user = await this._userRepository.createUser({...signUpData, password:hashedPassword})

        const otp=this._otpService.generateOtp()
        const expiresAt=new Date(Date.now()+60*1000)

        // await this.otpRepository.createOtp({userId:user._id,otp,expiresAt})
    }
    async verifyOtp(otp: OtpRequestDTO): Promise<SignupResponseDTO> {
        throw new Error("Method not implemented.");
    }

}