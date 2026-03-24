require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const app = express()

// ─── Security & Middleware ───────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ─── Routes ─────────────────────────────────────────
app.use('/api/auth',      require('./src/auth/auth.routes'))
app.use('/api/users',     require('./src/users/users.routes'))
app.use('/api/roles',     require('./src/roles/roles.routes'))
app.use('/api/issues',    require('./src/modules/issues/issues.routes'))
app.use('/api/assets',    require('./src/modules/assets/assets.routes'))
app.use('/api/audit',     require('./src/audit/audit.routes'))
app.use('/api/dashboard', require('./src/dashboard/dashboard.routes'))
app.use('/api/analytics', require('./src/analytics/analytics.routes'))
app.use('/api/ai',        require('./src/ai/ai.routes'))

// ─── Health check ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// ─── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🚀 DYnoGix API running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health: http://localhost:${PORT}/api/health\n`)
})

module.exports = app
