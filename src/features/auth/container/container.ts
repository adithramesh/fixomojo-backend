import { Container } from 'inversify'
import { TYPES } from '../types/types'
import { UserRepository } from '../repositories/user.repository'
import { OtpRepository } from '../repositories/otp.repository'
import { OtpService } from '../services/otp.service'
import { PasswordService } from '../services/password.service'
import { AuthService } from '../services/auth.services'
import { AuthController } from '../controllers/auth.controller'
import { AuthRoutes } from '../../../routes/auth.routes'

const container = new Container()

container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)
container.bind<OtpRepository>(TYPES.OtpRepository).to(OtpRepository)
container.bind<OtpService>(TYPES.OtpService).to(OtpService)
container.bind<PasswordService>(TYPES.PasswordService).to(PasswordService)
container.bind<AuthService>(TYPES.AuthService).to(AuthService)
container.bind<AuthController>(TYPES.AuthController).to(AuthController)
container.bind<AuthRoutes>(TYPES.AuthRoutes).to(AuthRoutes)

export default container;