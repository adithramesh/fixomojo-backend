import express, {Express} from 'express'
import cors from 'cors'
import config from './config/env'
import { TYPES } from './features/auth/types/types'
import { AuthRoutes } from './routes/auth.routes'
import container from './features/auth/container/container' 
import morgan from 'morgan'

const app:Express = express()
const corsOption:cors.CorsOptions={
    origin:config.CLIENT_URL,
    methods:"GET, POST, PUT, PATCH, DELETE",
    allowedHeaders:"Content-Type, Authorization"
}

app.use(cors(corsOption))
app.use(express.json())
app.use(morgan('combined'));    


const authRoutes = container.get<AuthRoutes>(TYPES.AuthRoutes)
app.use('/auth', authRoutes.getRouter())

export default app