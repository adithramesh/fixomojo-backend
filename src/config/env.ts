import dotenv from 'dotenv'
import path from 'path';
dotenv.config()

interface Config{
    PORT:number;
    CLIENT_URL:string[];
    JWT_SECRET: string;
    MONGO_URL:string;
    TWILIO_SID:string;
    TWILIO_AUTH_TOKEN:string;
    TWILIO_PHONE:string;
    GOOGLE_SERVICE_ACCOUNT_KEY_PATH:string;
    GOOGLE_CALENDAR_SCOPES:string[];
    RAZORPAY_KEY_ID: string;
    RAZORPAY_KEY_SECRET: string;
    STRIPE_SECRET_KEY:string;
    STRIPE_SUCCESS_URL:string;
    STRIPE_CANCEL_URL:string;
    STRIPE_TUNNEL_SUCCESS_URL:string;
    STRIPE_TUNNEL_CANCEL_URL:string;
    CLOUDINARY_NAME:string;
    CLOUDINARY_API_KEY:string;
    CLOUDINARY_API_SECRET:string;
    ADMIN_ID:string;
    STREAM_API_KEY:string;
    STREAM_API_SECRET: string;
    ACCESS_TOKEN_EXPIRY:string;
    REFRESH_TOKEN_EXPIRY:string;
    NODE_ENV:string;
}

const projectRoot = process.cwd();
const config:Config = {
    PORT: Number(process.env.PORT),
    CLIENT_URL: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:4200'],
    JWT_SECRET: process.env.JWT_SECRET as string,
    MONGO_URL: process.env.MONGO_URL as string,
    TWILIO_SID:process.env.TWILIO_SID as string,
    TWILIO_AUTH_TOKEN:process.env.TWILIO_AUTH_TOKEN as string,
    TWILIO_PHONE:process.env.TWILIO_PHONE as string,
    GOOGLE_SERVICE_ACCOUNT_KEY_PATH: path.join(
        projectRoot,
        'config', // This refers to the root-level 'config' folder
        'google-service-account-key.json' // The name of your downloaded JSON file
    ),
    GOOGLE_CALENDAR_SCOPES: process.env.GOOGLE_CALENDAR_SCOPES ? process.env.GOOGLE_CALENDAR_SCOPES.split(',') : ['https://www.googleapis.com/auth/calendar'],
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID as string,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET as string,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    CLOUDINARY_NAME:process.env.CLOUDINARY_NAME as string,
    CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET as string,
    ADMIN_ID:process.env.ADMIN_ID as string,
    STREAM_API_KEY:process.env.STREAM_API_KEY as string,
    STREAM_API_SECRET:process.env.STREAM_API_SECRET as string,
    STRIPE_SUCCESS_URL:process.env.STRIPE_SUCCESS_URL as string,
    STRIPE_CANCEL_URL:process.env.STRIPE_CANCEL_URL as string,
    STRIPE_TUNNEL_SUCCESS_URL:process.env.STRIPE_TUNNEL_SUCCESS_URL as string,
    STRIPE_TUNNEL_CANCEL_URL:process.env.STRIPE_TUNNEL_CANCEL_URL as string,
    ACCESS_TOKEN_EXPIRY:process.env.ACCESS_TOKEN_EXPIRY as string,
    REFRESH_TOKEN_EXPIRY:process.env.REFRESH_TOKEN_EXPIRY as string,
    NODE_ENV:process.env.NODE_ENV as string || 'development'
}




export default config