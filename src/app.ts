import express, {Express} from 'express'
import cors from 'cors'
import config from './config/env'

const app:Express = express()
const corsOption:cors.CorsOptions={
    origin:config.CLIENT_URL,
    methods:"GET, POST, PUT, PATCH, DELETE",
    allowedHeaders:"Content-Type, Authorization"
}

app.use(cors(corsOption))
app.use(express.json())


export default app