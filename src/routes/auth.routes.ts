import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { IAuthController } from '../controllers/auth/auth.controller.interface'



@injectable()
export class AuthRoutes{
    private router:Router
    constructor(
        @inject(TYPES.IAuthController) private _authController:IAuthController
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