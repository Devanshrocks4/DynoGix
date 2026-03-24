const express = require('express')
const { authenticate } = require('../middlewares/auth.middleware')

const router = express.Router()

router.get('/workflow', authenticate, (req, res) => {
  res.json({
    stageTimes: [
      { stage: 'Open → In Progress', avg: 4.2, target: 2, p95: 12 },
      { stage: 'In Progress → Resolved', avg: 18.6, target: 24, p95: 72 },
      { stage: 'Resolved → Closed', avg: 2.1, target: 4, p95: 8 },
    ],
    totalTransitions: 234,
    avgCycleTime: 24.9,
  })
})

router.get('/productivity', authenticate, (req, res) => {
  res.json({
    users: [
      { name: 'Maya Patel', resolved: 41, open: 2, avg: 0.9 },
      { name: 'Sarah Chen', resolved: 34, open: 4, avg: 1.2 },
      { name: 'Raj Sharma', resolved: 22, open: 5, avg: 1.8 },
      { name: 'James Park', resolved: 28, open: 6, avg: 2.1 },
      { name: 'Alex Turner', resolved: 19, open: 8, avg: 3.4 },
    ],
  })
})

router.get('/trends', authenticate, (req, res) => {
  const monthly = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month, i) => ({
    month,
    created: Math.floor(Math.random() * 40) + 10,
    resolved: Math.floor(Math.random() * 35) + 8,
    avg_time: Math.floor(Math.random() * 48) + 12,
  }))
  res.json({ monthly })
})

module.exports = router
