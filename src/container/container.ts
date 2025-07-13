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
import { TimeSlotController } from '../controllers/time-slot/time-slot.controller'
import { PartnerRoutes } from '../routes/partner.routes'
import { TimeSlotService } from '../services/time-slot/time-slot.service'
import { BookingRepository } from '../repositories/booking/booking.repository'
import { WalletRepository } from '../repositories/wallet/wallet.repository'
import { WalletService } from '../services/wallet/wallet.service'
import { WalletController } from '../controllers/wallet/wallet.controller'
import { WalletRoutes } from '../routes/wallet.routes'
import { TransactionRepository } from '../repositories/transaction/transaction.repository'
import { TransactionService } from '../services/transaction/transaction.service'
import { TransactionController } from '../controllers/transaction/transaction.controller'
import { TransactionRoutes } from '../routes/transactionRoutes'
import { BookingController } from '../controllers/booking/booking.controller'
import { BookingService } from '../services/booking/booking.service'
import { BookingRoutes } from '../routes/booking.routes'


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
container.bind<PartnerRoutes>(TYPES.PartnerRoutes).to(PartnerRoutes);
container.bind<TimeSlotController>(TYPES.TimeSlotController).to(TimeSlotController); 
container.bind<TimeSlotService>(TYPES.TimeSlotService).to(TimeSlotService); 
container.bind<BookingRepository>(TYPES.BookingRepository).to(BookingRepository)
container.bind<BookingService>(TYPES.BookingService).to(BookingService)
container.bind<BookingController>(TYPES.BookingController).to(BookingController)
container.bind<BookingRoutes>(TYPES.BookingRoutes).to(BookingRoutes)
container.bind<WalletRepository>(TYPES.WalletRepository).to(WalletRepository)
container.bind<WalletService>(TYPES.WalletService).to(WalletService)
container.bind<WalletController>(TYPES.WalletController).to(WalletController)
container.bind<WalletRoutes>(TYPES.WalletRoutes).to(WalletRoutes)
container.bind<TransactionRepository>(TYPES.TransactionRepository).to(TransactionRepository)
container.bind<TransactionService>(TYPES.TransactionService).to(TransactionService)
container.bind<TransactionController>(TYPES.TransactionController).to(TransactionController)
container.bind<TransactionRoutes>(TYPES.TransactionRoutes).to(TransactionRoutes)

export default container;