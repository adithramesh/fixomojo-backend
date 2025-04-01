import app from './app'
import { database } from './config/database';
import config from './config/env'



async function startServer() {
   try {
    await database.connect()
    app.listen(config.PORT,()=>{
        console.log(`Server running on http://localhost:${config.PORT}`);
    })
   } catch (error) {
    console.log('server failed to start due to database error:', error);
    process.exit(1)
   }
}

startServer()
