import { Container } from 'inversify'
import { TYPES } from '../types/types'
import { UserRepository } from '../repositories/user/user.repository'
import { OtpRepository } from '../repositories/otp/otp.repository'
import { IOtpService, OtpService } from '../../src/services/auth/otp.service'
import { IPasswordService, PasswordService } from '../services/auth/password.service'
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
import { ITransactionController } from '../controllers/transaction/transaction.controller.interface'
import { ITransactionRepository } from '../repositories/transaction/transaction.repository.interface'
import { ITransactionService } from '../services/transaction/transaction.service.interface'
import { IWalletController } from '../controllers/wallet/wallet.controller.interface'
import { IWalletRepository } from '../repositories/wallet/wallet.repository.interface'
import { IWalletService } from '../services/wallet/wallet.service.interface'
import { IBookingRepository } from '../repositories/booking/booking.repository.interface'
import { IBookingService } from '../services/booking/booking.service.interface'
import { IBookingController } from '../controllers/booking/booking.controller.interface'
import { ITimeSlotController } from '../controllers/time-slot/time-slot.controller.interface'
import { ITimeSlotService } from '../services/time-slot/time-slot.service.interface'
import { IServiceRepository } from '../repositories/service/service.repository.interface'
import { ISubServiceRepository } from '../repositories/sub-service/sub-service.repository.interface'
import { IAdminService } from '../services/admin/admin.service.interface'
import { IAdminController } from '../controllers/admin/admin.controller.interface'
import { IUserController } from '../controllers/users/user.controller.interface'
import { IUserService } from '../services/users/user.service.interface'
import { IUserRepository } from '../repositories/user/user.repository.interface'
import { IAuthController } from '../controllers/auth/auth.controller.interface'
import { IAuthService } from '../services/auth/auth.service.interface'
import { IOtpRepository } from '../repositories/otp/otp.repository.interface'


const container = new Container()

container.bind<IPasswordService>(TYPES.IPasswordService).to(PasswordService)

container.bind<IOtpService>(TYPES.IOtpService).to(OtpService)
container.bind<IOtpRepository>(TYPES.IOtpRepository).to(OtpRepository)

container.bind<IAuthController>(TYPES.IAuthController).to(AuthController)
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService)
container.bind<AuthRoutes>(TYPES.AuthRoutes).to(AuthRoutes)

container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository)
container.bind<IUserService>(TYPES.IUserService).to(UserService)
container.bind<IUserController>(TYPES.IUserController).to(UserController)
container.bind<UserRoutes>(TYPES.UserRoutes).to(UserRoutes)

container.bind<IAdminService>(TYPES.IAdminService).to(AdminService)
container.bind<IAdminController>(TYPES.IAdminController).to(AdminController)
container.bind<AdminRoutes>(TYPES.AdminRoutes).to(AdminRoutes)

container.bind<PartnerRoutes>(TYPES.PartnerRoutes).to(PartnerRoutes);

container.bind<IServiceRepository>(TYPES.IServiceRepository).to(ServiceRepository)
container.bind<ISubServiceRepository>(TYPES.ISubServiceRepository).to(SubServiceRepository)

container.bind<ITimeSlotController>(TYPES.ITimeSlotController).to(TimeSlotController); 
container.bind<ITimeSlotService>(TYPES.ITimeSlotService).to(TimeSlotService); 

container.bind<IBookingRepository>(TYPES.IBookingRepository).to(BookingRepository)
container.bind<IBookingService>(TYPES.IBookingService).to(BookingService)
container.bind<IBookingController>(TYPES.IBookingController).to(BookingController)
container.bind<BookingRoutes>(TYPES.BookingRoutes).to(BookingRoutes)

container.bind<IWalletRepository>(TYPES.IWalletRepository).to(WalletRepository)
container.bind<IWalletService>(TYPES.IWalletService).to(WalletService)
container.bind<IWalletController>(TYPES.IWalletController).to(WalletController)
container.bind<WalletRoutes>(TYPES.WalletRoutes).to(WalletRoutes)

container.bind<ITransactionRepository>(TYPES.ITransactionRepository).to(TransactionRepository)
container.bind<ITransactionService>(TYPES.ITransactionService).to(TransactionService)
container.bind<ITransactionController>(TYPES.ITransactionController).to(TransactionController)
container.bind<TransactionRoutes>(TYPES.TransactionRoutes).to(TransactionRoutes)

export default container;