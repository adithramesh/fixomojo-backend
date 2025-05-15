import express, {Express} from 'express'
import cors from 'cors'
import config from './config/env'
import { TYPES } from './types/types'
import { AuthRoutes } from './routes/auth.routes'
import container from './container/container' 
import morgan from 'morgan'
import { UserRoutes } from './routes/user.routes'

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
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });


const authRoutes = container.get<AuthRoutes>(TYPES.AuthRoutes)
const userRoutes = container.get<UserRoutes>(TYPES.UserRoutes)
const adminRoutes = container.get<UserRoutes>(TYPES.AdminRoutes)
app.use('/auth', authRoutes.getRouter())
app.use('/user', userRoutes.getRouter())
app.use('/admin', adminRoutes.getRouter())

export default app