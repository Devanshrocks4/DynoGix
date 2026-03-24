const express = require('express')
const { authenticate, authorize } = require('../middlewares/auth.middleware')

const router = express.Router()

const roles = [
  {
    id: 'admin', name: 'Admin', description: 'Full system access',
    permissions: ['issues.view','issues.create','issues.update','issues.delete','issues.assign','assets.view','assets.manage','audit.view','roles.manage','users.manage','analytics.view','workflows.configure'],
  },
  {
    id: 'manager', name: 'Manager', description: 'Team-level access',
    permissions: ['issues.view','issues.create','issues.update','issues.assign','assets.view','assets.manage','audit.view','analytics.view'],
  },
  {
    id: 'user', name: 'User', description: 'Personal access only',
    permissions: ['issues.view','issues.create','issues.update','assets.view','analytics.view'],
  },
]

router.get('/', authenticate, (req, res) => res.json({ roles }))

router.put('/:id/permissions', authenticate, authorize('admin'), (req, res) => {
  const role = roles.find(r => r.id === req.params.id)
  if (!role) return res.status(404).json({ error: 'Role not found' })
  const { permissions } = req.body
  if (!Array.isArray(permissions)) return res.status(400).json({ error: 'permissions must be an array' })
  role.permissions = permissions
  res.json({ role })
})

module.exports = router
