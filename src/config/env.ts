import dotenv from 'dotenv'
import path from 'path';
dotenv.config()

interface Config{
    PORT:number;
    CLIENT_URL:string;
    JWT_SECRET: string;
    MONGO_URL:string;
    TWILIO_SID:string;
    TWILIO_AUTH_TOKEN:string;
    TWILIO_PHONE:string;
    GOOGLE_SERVICE_ACCOUNT_KEY_PATH:string;
}

const projectRoot = process.cwd();
const config:Config = {
    PORT: Number(process.env.PORT),
    CLIENT_URL: process.env.CLIENT_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    MONGO_URL: process.env.MONGO_URL as string,
    TWILIO_SID:process.env.TWILIO_SID as string,
    TWILIO_AUTH_TOKEN:process.env.TWILIO_AUTH_TOKEN as string,
    TWILIO_PHONE:process.env.TWILIO_PHONE as string,
    GOOGLE_SERVICE_ACCOUNT_KEY_PATH: path.join(
        projectRoot,
        'config', // This refers to the root-level 'config' folder
        'google-service-account-key.json' // The name of your downloaded JSON file
    )
}




export default config