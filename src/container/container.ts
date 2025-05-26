import { Container } from 'inversify'
import { TYPES } from '../types/types'
import { UserRepository } from '../repositories/user/user.repository'
import { OtpRepository } from '../repositories/otp/otp.repository'
import { OtpService } from '../services/auth/otp.service'
import { PasswordService } from '../services/auth/password.service'
import { AuthService } from '../services/auth/auth.services'
import { AuthController } from '../controllers/auth/auth.controller'
import { AuthRoutes } from '../routes/auth.routes'
import { ServiceRepository } from '../repositories/service/service.repository'
import { UserService } from '../services/users/user.service'
import { UserController } from '../controllers/users/user.controller'
import { UserRoutes } from '../routes/user.routes'
import { AdminService } from '../services/admin/admin.service'
import { AdminController } from '../controllers/admin/admin.controller'
import { AdminRoutes } from '../routes/admin.routes'
import { SubServiceRepository } from '../repositories/sub-service/sub-service.repository'


const container = new Container()

container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)
container.bind<OtpRepository>(TYPES.OtpRepository).to(OtpRepository)
container.bind<OtpService>(TYPES.OtpService).to(OtpService)
container.bind<PasswordService>(TYPES.PasswordService).to(PasswordService)
container.bind<AuthService>(TYPES.AuthService).to(AuthService)
container.bind<AuthController>(TYPES.AuthController).to(AuthController)
container.bind<AuthRoutes>(TYPES.AuthRoutes).to(AuthRoutes)
container.bind<ServiceRepository>(TYPES.ServiceRepository).to(ServiceRepository)
container.bind<SubServiceRepository>(TYPES.SubServiceRepository).to(SubServiceRepository)
container.bind<UserService>(TYPES.UserService).to(UserService)
container.bind<UserController>(TYPES.UserController).to(UserController)
container.bind<UserRoutes>(TYPES.UserRoutes).to(UserRoutes)
container.bind<AdminService>(TYPES.AdminService).to(AdminService)
container.bind<AdminController>(TYPES.AdminController).to(AdminController)
container.bind<AdminRoutes>(TYPES.AdminRoutes).to(AdminRoutes)

export default container;