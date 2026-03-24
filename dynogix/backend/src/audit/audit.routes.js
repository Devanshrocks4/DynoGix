const express = require('express')
const { authenticate, authorize } = require('../middlewares/auth.middleware')
const { getAuditLogs, getEntityLogs } = require('./audit.store')

const router = express.Router()

router.get('/', authenticate, authorize('admin', 'manager'), (req, res) => {
  const { page = 1, limit = 50, action, module, actor } = req.query
  const result = getAuditLogs({ page: parseInt(page), limit: parseInt(limit), action, module, actor })
  res.json(result)
})

router.get('/:module/:id', authenticate, (req, res) => {
  const logs = getEntityLogs(req.params.module, req.params.id)
  res.json({ logs })
})

module.exports = router
