import { injectable } from "inversify";
import { IStreamService } from "./stream.service.interface";
import { StreamClient } from "@stream-io/node-sdk";
import  config  from "../../config/env";

@injectable()
export class StreamService implements IStreamService {
    private streamClient:StreamClient

    constructor(){
        this.streamClient = new StreamClient(config.STREAM_API_KEY, config.STREAM_API_SECRET)
    }
    async generateStreamToken(userId: string): Promise<string> {
        try {
            if(!userId){
                throw new Error('User ID is required')
            }
            const token = this.streamClient.generateUserToken({ user_id: userId });
            return token
        } catch (error) {
            console.error('Error generating Stream token:', error);
            throw error
        }
    }
}