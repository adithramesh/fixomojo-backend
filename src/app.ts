import express, {Express} from 'express'
import cors from 'cors'
import config from './config/env'
import { TYPES } from './types/types'
import { AuthRoutes } from './routes/auth.routes'
import container from './container/container' 
import morgan from 'morgan'
import { UserRoutes } from './routes/user.routes'
import { HttpStatus } from './utils/http-status.enum'
import { PartnerRoutes } from './routes/partner.routes'
import { AdminRoutes } from './routes/admin.routes'
import { WalletRoutes } from './routes/wallet.routes'
import { TransactionRoutes } from './routes/transactionRoutes'
import { BookingRoutes } from './routes/booking.routes'
import { ChatRoutes } from './routes/chat.routes'

const app:Express = express()
const corsOption:cors.CorsOptions={
    origin:config.CLIENT_URL,
    methods:"GET, POST, PUT, PATCH, DELETE",
    allowedHeaders:['Authorization', 'Content-Type']
}

app.use(cors(corsOption))
app.use(express.json())
app.use(morgan('combined'));   

app.get('/health', (_req, res) => {
    res.status(HttpStatus.SUCCESS).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });


const authRoutes = container.get<AuthRoutes>(TYPES.AuthRoutes)
const userRoutes = container.get<UserRoutes>(TYPES.UserRoutes)
const adminRoutes = container.get<AdminRoutes>(TYPES.AdminRoutes)
const partnerRoutes = container.get<PartnerRoutes>(TYPES.PartnerRoutes)
const walletRoutes = container.get<WalletRoutes>(TYPES.WalletRoutes)
const bookingRoutes = container.get<BookingRoutes>(TYPES.BookingRoutes)
const transactionRoutes = container.get<TransactionRoutes>(TYPES.TransactionRoutes)
const chatRoutes = container.get<ChatRoutes>(TYPES.ChatRoutes)
app.use('/auth', authRoutes.getRouter())
app.use('/user', userRoutes.getRouter())
app.use('/admin', adminRoutes.getRouter())
app.use('/partner',partnerRoutes.getRouter())
app.use('/wallet', walletRoutes.getRouter())
app.use('/transaction', transactionRoutes.getRouter())
app.use('/booking', bookingRoutes.getRouter())
app.use('/chat', chatRoutes.getRouter())

export default app