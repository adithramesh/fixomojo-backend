import { Container } from 'inversify'
import { TYPES } from '../types/types'
import { UserRepository } from '../repositories/user.repository'
import { OtpRepository } from '../repositories/otp.repository'
import { OtpService } from '../features/auth/services/otp.service'
import { PasswordService } from '../features/auth/services/password.service'
import { AuthService } from '../features/auth/services/auth.services'
import { AuthController } from '../features/auth/controllers/auth.controller'
import { AuthRoutes } from '../routes/auth.routes'
import { ServiceRepository } from '../repositories/service.repository'
import { UserService } from '../features/users/services/user.service'
import { UserController } from '../features/users/controllers/user.controller'
import { UserRoutes } from '../routes/user.routes'


const container = new Container()

container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)
container.bind<OtpRepository>(TYPES.OtpRepository).to(OtpRepository)
container.bind<OtpService>(TYPES.OtpService).to(OtpService)
container.bind<PasswordService>(TYPES.PasswordService).to(PasswordService)
container.bind<AuthService>(TYPES.AuthService).to(AuthService)
container.bind<AuthController>(TYPES.AuthController).to(AuthController)
container.bind<AuthRoutes>(TYPES.AuthRoutes).to(AuthRoutes)
container.bind<ServiceRepository>(TYPES.ServiceRepository).to(ServiceRepository)
container.bind<UserService>(TYPES.UserService).to(UserService)
container.bind<UserController>(TYPES.UserController).to(UserController)
container.bind<UserRoutes>(TYPES.UserRoutes).to(UserRoutes)

export default container;