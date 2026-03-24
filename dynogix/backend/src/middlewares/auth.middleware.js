const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dynogix_dev_secret_change_in_production'

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' })
  }
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(' or ')}` })
    }
    next()
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

module.exports = { authenticate, authorize, signToken }
