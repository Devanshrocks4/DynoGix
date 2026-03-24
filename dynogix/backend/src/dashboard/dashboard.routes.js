// dashboard.routes.js
const express = require('express')
const { authenticate } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/stats', authenticate, (req, res) => {
  res.json({
    issues: { total: 142, open: 38, resolved: 89, critical: 7, change: 12 },
    assets: { total: 56, assigned: 41, available: 15, change: -3 },
    users: { total: 24, active: 18, change: 6 },
    workflows: { completed: 234, pending: 31, change: 18 },
  })
})

router.get('/activity', authenticate, (req, res) => {
  const activities = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    user: ['Sarah Chen', 'James Park', 'Maya Patel', 'Alex Turner'][i % 4],
    action: ['Resolved issue', 'Created issue', 'Assigned asset', 'Updated workflow'][i % 4],
    entity: `ISS-${100 + i}`,
    time: new Date(Date.now() - i * 1000 * 60 * 15).toISOString(),
  }))
  res.json({ activities })
})

router.get('/charts', authenticate, (req, res) => {
  const trends = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    issues: Math.floor(Math.random() * 12) + 2,
    resolved: Math.floor(Math.random() * 10) + 1,
    assets: Math.floor(Math.random() * 5) + 1,
  }))
  res.json({ trends })
})

module.exports = router
