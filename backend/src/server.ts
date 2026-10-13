import 'dotenv/config'
import app from './app.js'
import './workers/orderExpiry.worker.js'

async function startServer() {
  
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server listening: http://localhost:${process.env.PORT || 5000}`);
  })
}

startServer();