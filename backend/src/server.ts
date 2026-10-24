import 'dotenv/config'
import app from './app.js'
import './workers/orderExpiry.worker.js'
import { env } from './config/env.js'

async function startServer() {
  
  app.listen(env.PORT, () => {
    console.log(`Server listening: http://localhost:${env.PORT}`);
  })
}

startServer();
