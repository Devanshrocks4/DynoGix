const express = require('express')
const crypto = require('crypto')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')
const { createAuditLog } = require('../../audit/audit.store')
const workflowEngine = require('../../workflow/engine')

const router = express.Router()

// In-memory issues store
let issues = Array.from({ length: 20 }, (_, i) => ({
  id: `ISS-${String(i + 100).padStart(3, '0')}`,
  title: [
    'API rate limiting not working', 'Dashboard charts not loading', 'Auth token expiry bug',
    'Search returning duplicates', 'Email notifications delayed', 'Asset export broken in Firefox',
    'Role permissions not saved', 'Audit log timezone error', 'Memory leak in workflow job',
    'CSV import fails on large files', 'Dark mode toggle broken', 'PDF generation hangs',
    'Webhook retries causing duplicates', 'Session timeout too aggressive', 'Bulk action state not cleared',
    '2FA setup fails on new devices', 'Sorting by date broken', 'Comment notifications incomplete',
    'Integration test suite flaky', 'Performance degradation on search'
  ][i],
  description: 'Detailed description here...',
  status: ['open', 'in_progress', 'resolved', 'closed'][i % 4],
  priority: ['critical', 'high', 'medium', 'low'][i % 4],
  assignee: ['Sarah Chen', 'James Park', 'Maya Patel', null][i % 4],
  tags: [['backend'], ['frontend'], ['api', 'bug'], ['ui']][i % 4],
  comments: [],
  createdBy: 'admin@dynogix.com',
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
}))

// GET /api/issues
router.get('/', authenticate, (req, res) => {
  const { status, priority, assignee, search, page = 1, limit = 50 } = req.query
  let result = [...issues]
  if (status) result = result.filter(i => i.status === status)
  if (priority) result = result.filter(i => i.priority === priority)
  if (assignee) result = result.filter(i => i.assignee === assignee)
  if (search) result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
  const total = result.length
  const start = (parseInt(page) - 1) * parseInt(limit)
  res.json({ issues: result.slice(start, start + parseInt(limit)), total, page: parseInt(page) })
})

// GET /api/issues/:id
router.get('/:id', authenticate, (req, res) => {
  const issue = issues.find(i => i.id === req.params.id)
  if (!issue) return res.status(404).json({ error: 'Issue not found' })
  res.json({ issue })
})

// POST /api/issues
router.post('/', authenticate, (req, res) => {
  const { title, description, priority = 'medium', assignee, tags = [] } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })

  const issue = {
    id: `ISS-${String(Date.now()).slice(-6)}`,
    title: title.trim(), description, priority, assignee, tags,
    status: workflowEngine.getInitialState('issue'),
    comments: [],
    createdBy: req.user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  issues.unshift(issue)

  createAuditLog({
    actor: req.user.name, actorId: req.user.id, action: 'CREATE',
    module: 'issues', entityId: issue.id,
    detail: `Created issue: ${issue.title}`, after: issue, ip: req.ip,
  })

  res.status(201).json({ issue })
})

// PUT /api/issues/:id
router.put('/:id', authenticate, (req, res) => {
  const idx = issues.findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Issue not found' })

  const before = { ...issues[idx] }
  const { title, description, priority, assignee, tags } = req.body
  const allowed = { title, description, priority, assignee, tags }
  Object.keys(allowed).forEach(k => allowed[k] !== undefined && (issues[idx][k] = allowed[k]))
  issues[idx].updatedAt = new Date().toISOString()

  createAuditLog({
    actor: req.user.name, actorId: req.user.id, action: 'UPDATE',
    module: 'issues', entityId: req.params.id,
    detail: `Updated issue ${req.params.id}`, before, after: issues[idx], ip: req.ip,
  })

  res.json({ issue: issues[idx] })
})

// POST /api/issues/:id/transition
router.post('/:id/transition', authenticate, (req, res) => {
  const { status: targetStatus } = req.body
  const idx = issues.findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Issue not found' })

  try {
    const result = workflowEngine.transition('issue', issues[idx].status, targetStatus)
    const before = { status: issues[idx].status }
    issues[idx].status = targetStatus
    issues[idx].updatedAt = new Date().toISOString()

    createAuditLog({
      actor: req.user.name, actorId: req.user.id, action: 'TRANSITION',
      module: 'issues', entityId: req.params.id,
      detail: `Transitioned ${req.params.id}: ${result.from} → ${result.to}`,
      before, after: { status: targetStatus }, ip: req.ip,
    })

    res.json({ issue: issues[idx], transition: result })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/issues/:id
router.delete('/:id', authenticate, authorize('admin', 'manager'), (req, res) => {
  const idx = issues.findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Issue not found' })

  const [deleted] = issues.splice(idx, 1)
  createAuditLog({
    actor: req.user.name, actorId: req.user.id, action: 'DELETE',
    module: 'issues', entityId: req.params.id,
    detail: `Deleted issue: ${deleted.title}`, before: deleted, ip: req.ip,
  })

  res.json({ message: 'Issue deleted' })
})

// GET /api/issues/:id/comments
router.get('/:id/comments', authenticate, (req, res) => {
  const issue = issues.find(i => i.id === req.params.id)
  if (!issue) return res.status(404).json({ error: 'Issue not found' })
  res.json({ comments: issue.comments })
})

// POST /api/issues/:id/comments
router.post('/:id/comments', authenticate, (req, res) => {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' })

  const idx = issues.findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Issue not found' })

  const comment = {
    id: crypto.randomUUID(), content: content.trim(),
    author: req.user.name, authorId: req.user.id,
    createdAt: new Date().toISOString(),
  }
  issues[idx].comments.push(comment)

  createAuditLog({
    actor: req.user.name, actorId: req.user.id, action: 'UPDATE',
    module: 'issues', entityId: req.params.id,
    detail: `Added comment to ${req.params.id}`, ip: req.ip,
  })

  res.status(201).json({ comment })
})

module.exports = router
