import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDB, db } from './config/db.js'
import { testEmailConfig } from './utils/emailService.js'
import { initOTPTable } from './utils/otpStore.js'
import { initAuthSessionTable } from './utils/authSessionStore.js'
import authRouter from './routes/authRoutes.js'
import productRouter from './routes/productRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import employeeRouter from './routes/employeeRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import consumerRouter from './routes/consumerRoutes.js'

// ────────────────────────────────────
// Environment variable validation
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'COMPANY_EMAIL']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
}
// ────────────────────────────────────
// App config
// ────────────────────────────────────
const app = express()
app.set('trust proxy', 1)
const port = process.env.PORT || 3000

// ────────────────────────────────────
// Security Middlewares
// ────────────────────────────────────

// Helmet — sets various HTTP security headers
app.use(helmet())

// CORS — whitelist specific origins instead of allowing all
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})
app.use(globalLimiter)

// Strict rate limiter for auth routes — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' },
})

// ────────────────────────────────────
// Database & Initialization
// ────────────────────────────────────
await connectDB()
await initOTPTable()
await initAuthSessionTable()

// Test email configuration
await testEmailConfig()

// ────────────────────────────────────
// API endpoints
// ────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/admin', adminRouter)
app.use('/api/consumer', consumerRouter)

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db().query('SELECT 1')
    res.json({ status: 'ok', db: 'connected', uptime: process.uptime() })
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' })
  }
})

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Shop4Ever API is running' })
})

// ────────────────────────────────────
// Global Error Handler
// ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message)
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
})

// ────────────────────────────────────
// Graceful shutdown handlers
// ────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

// ────────────────────────────────────
// Start server
// ────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Shop4Ever API running on port ${port}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`)
})
