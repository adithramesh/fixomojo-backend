import {Container} from 'inversify'
import {TYPES} from '../types/types'
import { UserRepository } from '../repositories/user.repository'
import { OtpRepository } from '../repositories/otp.repository'
import { OtpService } from '../services/otp.service'
import { PasswordService } from '../services/password.service'

const container = new Container()
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)
container.bind<OtpRepository>(TYPES.OtpRepository).to(OtpRepository)
container.bind<OtpService>(TYPES.OtpService).to(OtpService)
container.bind<PasswordService>(TYPES.PasswordService).to(PasswordService)

export {container}