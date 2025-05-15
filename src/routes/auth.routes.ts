import { Router } from 'express'
import { AuthController } from '../controllers/auth/auth.controller'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'



@injectable()
export class AuthRoutes{
    private router:Router
    constructor(
        @inject(TYPES.AuthController) private _authController:AuthController
    ){
        this.router=Router()
        this.initializeRoutes()
    }

    private initializeRoutes(){
        this.router.post('/signup',this._authController.signup.bind(this._authController))
        this.router.post('/verify-otp',this._authController.verifyOtp.bind(this._authController))
        this.router.post('/resend-otp',this._authController.resendOtp.bind(this._authController))
        this.router.post('/forgot-password',this._authController.forgotPassword.bind(this._authController))
        this.router.post('/reset-password',this._authController.resetPassword.bind(this._authController))
        this.router.post('/login',this._authController.login.bind(this._authController))
        this.router.post('/refresh-token', this._authController.refreshToken.bind(this._authController));
    }

    public getRouter(){
        return this.router
    }


}