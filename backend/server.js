import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from './config/db.js'

//App config
const app = express()
const port = process.env.PORT || 3000

//Middlewares
app.use(express.json())
app.use(cors())
await connectDB();

//Api endpoints

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
