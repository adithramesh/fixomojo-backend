import dotenv from 'dotenv'
dotenv.config()

interface Config{
    PORT:number;
    CLIENT_URL:string;
    JWT_SECRET: string;
    MONGO_URL:string;
}


const config:Config = {
    PORT: Number(process.env.PORT),
    CLIENT_URL: process.env.CLIENT_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    MONGO_URL: process.env.MONGO_URL as string
}

export default config