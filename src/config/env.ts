import dotenv from 'dotenv'
dotenv.config()

interface Config{
    PORT:number;
    CLIENT_URL:string;
    JWT_SECRET: string;
    MONGO_URL:string;
    TWILIO_SID:string;
    TWILIO_AUTH_TOKEN:string;
    TWILIO_PHONE:string;
}


const config:Config = {
    PORT: Number(process.env.PORT),
    CLIENT_URL: process.env.CLIENT_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    MONGO_URL: process.env.MONGO_URL as string,
    TWILIO_SID:process.env.TWILIO_SID as string,
    TWILIO_AUTH_TOKEN:process.env.TWILIO_AUTH_TOKEN as string,
    TWILIO_PHONE:process.env.TWILIO_PHONE as string 
}

export default config