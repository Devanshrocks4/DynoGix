const express = require('express')
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const { createAuditLog } = require('../audit/audit.store')
const { usersStore: allUsers } = require('../auth/auth.routes')

const router = express.Router()

router.get('/', authenticate, (req, res) => {
  const users = allUsers.map(u => ({
    id: u.id.split('-')[1] || u.id.slice(-4),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    joined: u.createdAt
  }))
  res.json({ users })
})

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const idx = allUsers.findIndex(u => {
    const simpleId = u.id.split('-')[1] || u.id.slice(-4)
    return simpleId === req.params.id
  })
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  const { name, status } = req.body
  if (name) allUsers[idx].name = name
  if (status) allUsers[idx].status = status
  createAuditLog({ actor: req.user.name, actorId: req.user.id, action: 'UPDATE', module: 'users', entityId: req.params.id, detail: `Updated user ${allUsers[idx].name}`, ip: req.ip })
  res.json({ user: allUsers[idx] })
})

router.put('/:id/role', authenticate, authorize('admin'), (req, res) => {
  const idx = allUsers.findIndex(u => {
    const simpleId = u.id.split('-')[1] || u.id.slice(-4)
    return simpleId === req.params.id
  })
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  const { role } = req.body
  if (!['admin', 'manager', 'user'].includes(role)) return res.status(400).json({ error: 'Invalid role' })
  const before = { role: allUsers[idx].role }
  allUsers[idx].role = role
  createAuditLog({ actor: req.user.name, actorId: req.user.id, action: 'ROLE_CHANGE', module: 'users', entityId: req.params.id, detail: `Role changed to ${role}`, before, after: { role }, ip: req.ip })
  res.json({ user: allUsers[idx] })
})

module.exports = router
