import { createServer } from 'http';
import app from './app'
import { database } from './config/database';
import config from './config/env'
import { startCleanupJob } from './utils/jobs/cron-jobs';
import { SocketConfig } from './config/socket';
import container from './container/container';
import { TYPES } from './types/types';

async function startServer() {
   try {
    await database.connect()
    startCleanupJob(); // Start the cron job after DB connection

    const httpServer = createServer(app);
    const socketConfig = container.get<SocketConfig>(TYPES.SocketConfig)
    socketConfig.initSocket(httpServer);

    httpServer.listen(config.PORT,()=>{
        console.log(`Server running on http://localhost:${config.PORT}`);
    })
   } catch (error) {
    console.log('server failed to start due to database error:', error);
    process.exit(1)
   }
}

startServer()
