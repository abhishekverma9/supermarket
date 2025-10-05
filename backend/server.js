import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRouter from './routes/authRoutes.js'
import productRouter from './routes/productRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import employeeRouter from './routes/employeeRoutes.js'
import adminRouter from './routes/adminRoutes.js'

//App config
const app = express()
const port = process.env.PORT || 3000

//Middlewares
app.use(express.json())
app.use(cors())
await connectDB();

//Api endpoints
app.use('/api/auth',authRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/employee',employeeRouter)
app.use('/api/admin',adminRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
