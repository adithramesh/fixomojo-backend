import { database } from "../../../config/database";
import { OtpRequestDTO } from "../dto/otp-verify.dto";
import { SignupUserRequestDTO, SignupResponseDTO } from "../dto/signup.dto";
import { OtpRepository } from "../repositories/otp.repository";
import { UserRepository } from "../repositories/user.repository";
import { IAuthService } from "./auth.service.interface";
import { OtpService } from "./otp.service";
import { PasswordService } from "./password.service";

export class authService implements IAuthService{
    private userRepository:UserRepository
    private otpRepository:OtpRepository
    private passwordService:PasswordService
    private otpService:OtpService
    constructor(){
        this.userRepository=new UserRepository()
        this.otpRepository=new OtpRepository()
        this.passwordService=new PasswordService()
        this.otpService=new OtpService()
    }
    async signup(signUpData: SignupUserRequestDTO): Promise<any> {
        const {email, password}= signUpData
        const existingUser = await this.userRepository.findUserByEmail(email)
        if(existingUser){
            return {message:"User already exists", status:404}
        }

        const hashedPassword=await this.passwordService.hash(password)
        const user = await this.userRepository.createUser({...signUpData, password:hashedPassword})

        const otp=this.otpService.generateOtp()
        const expiresAt=new Date(Date.now()+60*1000)

        // await this.otpRepository.createOtp({userId:user._id,otp,expiresAt})
    }
    async verifyOtp(otp: OtpRequestDTO): Promise<SignupResponseDTO> {
        throw new Error("Method not implemented.");
    }

}