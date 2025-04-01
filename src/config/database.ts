import mongoose from 'mongoose';
import config from './env'

interface Database {
    connect():Promise<void>
}

class MongoDBConnection implements Database{
    public async connect(): Promise<void> {
        try {
            await mongoose.connect(config.MONGO_URL)
            console.log("Mongo DB connected successfully");
        } catch (error) {
            console.error("MongoDB connection error", error);
            process.exit(1)
        }
    }
}

export const database :Database = new MongoDBConnection()