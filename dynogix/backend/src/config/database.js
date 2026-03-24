const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'dynogix',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone: '+00:00',
  charset: 'utf8mb4',
})

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected')
    conn.release()
  })
  .catch(err => {
    console.warn('⚠️  MySQL not available — using mock data mode')
  })

module.exports = pool
