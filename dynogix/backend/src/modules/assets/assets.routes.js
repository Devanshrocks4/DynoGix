const express = require('express')
const crypto = require('crypto')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')
const { createAuditLog } = require('../../audit/audit.store')
const workflowEngine = require('../../workflow/engine')

const router = express.Router()

let assets = Array.from({ length: 20 }, (_, i) => ({
  id: `AST-${String(i + 1).padStart(3, '0')}`,
  name: ['MacBook Pro 16"', 'Dell XPS 15', 'HP ProBook 450', 'ThinkPad X1', 'Mac Mini M2',
    'Dell PowerEdge', 'HP ProLiant', 'Synology NAS', 'LG 4K Monitor', 'Samsung Galaxy S24',
    'iPhone 15 Pro', 'iPad Pro', 'Cisco Switch', 'APC UPS', 'Logitech MX Master',
    'Jabra Headset', 'Blue Yeti Mic', 'USB-C Hub', 'Thunderbolt Dock', 'External SSD'][i],
  type: ['laptop', 'laptop', 'laptop', 'laptop', 'server', 'server', 'server', 'storage', 'monitor', 'phone',
    'phone', 'phone', 'other', 'other', 'other', 'other', 'other', 'other', 'other', 'storage'][i],
  status: ['available', 'assigned', 'in_use', 'maintenance', 'available'][i % 5],
  assignee: i % 3 === 0 ? null : ['Sarah Chen', 'James Park', 'Maya Patel'][i % 3],
  serial: `SN${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
  value: Math.floor(Math.random() * 3000 + 200),
  location: ['HQ Floor 1', 'HQ Floor 2', 'Remote', 'Warehouse'][i % 4],
  createdAt: new Date(Date.now() - i * 86400000 * 30).toISOString(),
  updatedAt: new Date().toISOString(),
}))

router.get('/', authenticate, (req, res) => {
  const { type, status, search } = req.query
  let result = [...assets]
  if (type) result = result.filter(a => a.type === type)
  if (status) result = result.filter(a => a.status === status)
  if (search) result = result.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search))
  res.json({ assets: result, total: result.length })
})

router.get('/:id', authenticate, (req, res) => {
  const asset = assets.find(a => a.id === req.params.id)
  if (!asset) return res.status(404).json({ error: 'Asset not found' })
  res.json({ asset })
})

router.post('/', authenticate, authorize('admin', 'manager'), (req, res) => {
  const { name, type = 'other', value = 0, location = '', serial = '' } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })

  const asset = {
    id: `AST-${String(Date.now()).slice(-5)}`,
    name: name.trim(), type, value, location, serial: serial || crypto.randomUUID().slice(0, 10).toUpperCase(),
    status: workflowEngine.getInitialState('asset'),
    assignee: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  assets.unshift(asset)

  createAuditLog({
    actor: req.user.name, actorId: req.user.id, action: 'CREATE',
    module: 'assets', entityId: asset.id,
    detail: `Created asset: ${asset.name}`, after: asset, ip: req.ip,
  })

  res.status(201).json({ asset })
})

router.put('/:id', authenticate, authorize('admin', 'manager'), (req, res) => {
  const idx = assets.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Asset not found' })

  const before = { ...assets[idx] }
  const { name, type, value, location, assignee } = req.body
  const allowed = { name, type, value, location, assignee }
  Object.keys(allowed).forEach(k => allowed[k] !== undefined && (assets[idx][k] = allowed[k]))
  assets[idx].updatedAt = new Date().toISOString()

  createAuditLog({
    actor: req.user.name, actorId: req.user.id, action: 'UPDATE',
    module: 'assets', entityId: req.params.id,
    detail: `Updated asset ${req.params.id}`, before, after: assets[idx], ip: req.ip,
  })

  res.json({ asset: assets[idx] })
})

router.post('/:id/transition', authenticate, (req, res) => {
  const { status: targetStatus } = req.body
  const idx = assets.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Asset not found' })

  try {
    const result = workflowEngine.transition('asset', assets[idx].status, targetStatus)
    const before = { status: assets[idx].status }
    assets[idx].status = targetStatus
    assets[idx].updatedAt = new Date().toISOString()

    createAuditLog({
      actor: req.user.name, actorId: req.user.id, action: 'TRANSITION',
      module: 'assets', entityId: req.params.id,
      detail: `Asset ${req.params.id}: ${result.from} → ${result.to}`,
      before, after: { status: targetStatus }, ip: req.ip,
    })

    res.json({ asset: assets[idx], transition: result })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
