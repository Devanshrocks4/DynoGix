const express = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const { signToken, authenticate } = require('../middlewares/auth.middleware')
const { createAuditLog } = require('../audit/audit.store')

const router = express.Router()

// In-memory user store (swap with MySQL queries in production)
const users = [
  {
    id: 'usr-admin-001',
    name: 'Admin User',
    email: 'admin@dynogix.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-mgr-001',
    name: 'Sarah Chen',
    email: 'sarah@dynogix.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'manager',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-user-001',
    name: 'James Park',
    email: 'james@dynogix.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-devansh-admin',
    name: 'Devansh Gupta',
    email: 'devansh@gupta.com',
    password: bcrypt.hashSync('devanshgupta', 10),
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-devansh-mgr',
    name: 'Devansh Gupta',
    email: 'devanshgupta@gmail.com',
    password: bcrypt.hashSync('devansh', 10),
    role: 'manager',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
]

// POST /api/auth/login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid credentials format' })

    const { email, password } = req.body
    const user = users.find(u => u.email === email)
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account is deactivated' })
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    createAuditLog({
      actor: user.name, actorId: user.id, action: 'LOGIN',
      module: 'auth', entityId: user.id,
      detail: `${user.name} signed in`, ip: req.ip,
    })

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  }
)

// POST /api/auth/signup
router.post('/signup',
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { name, email, password, role = 'user' } = req.body
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPw = await bcrypt.hash(password, 10)
    const safeRole = ['admin', 'manager', 'user'].includes(role) ? role : 'user'
    const newUser = { id: crypto.randomUUID(), name, email, password: hashedPw, role: safeRole, status: 'active', createdAt: new Date().toISOString() }
    users.push(newUser)

    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name })

    createAuditLog({
      actor: newUser.name, actorId: newUser.id, action: 'CREATE',
      module: 'auth', entityId: newUser.id,
      detail: `New account created for ${newUser.email}`, ip: req.ip,
    })

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    })
  }
)

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password, ...safe } = user
  res.json({ user: safe })
})

module.exports = router
// Export users store for other modules
module.exports.usersStore = users
