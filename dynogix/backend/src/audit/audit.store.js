const crypto = require('crypto')

// In-memory audit store (use MySQL in production)
const auditLog = []

function createAuditLog({ actor, actorId, action, module, entityId, detail, before, after, ip }) {
  const entry = {
    id: crypto.randomUUID(),
    actor,
    actorId,
    action,
    module,
    entityId,
    detail,
    before: before ? JSON.stringify(before) : null,
    after: after ? JSON.stringify(after) : null,
    ip: ip || '0.0.0.0',
    timestamp: new Date().toISOString(),
  }
  auditLog.unshift(entry)
  if (auditLog.length > 5000) auditLog.pop()
  return entry
}

function getAuditLogs({ page = 1, limit = 50, action, module, actor } = {}) {
  let logs = [...auditLog]
  if (action) logs = logs.filter(l => l.action === action)
  if (module) logs = logs.filter(l => l.module === module)
  if (actor) logs = logs.filter(l => l.actor?.toLowerCase().includes(actor.toLowerCase()))
  const total = logs.length
  const start = (page - 1) * limit
  return { logs: logs.slice(start, start + limit), total, page, pages: Math.ceil(total / limit) }
}

function getEntityLogs(module, entityId) {
  return auditLog.filter(l => l.module === module && l.entityId === entityId)
}

// Seed some initial audit data
const SEED_ACTORS = ['Sarah Chen', 'James Park', 'Maya Patel', 'Alex Turner', 'Admin']
const SEED_ACTIONS = ['CREATE', 'UPDATE', 'TRANSITION', 'ASSIGN', 'LOGIN', 'DELETE']
const SEED_MODULES = ['issues', 'assets', 'users', 'auth', 'workflow']
const SEED_DETAILS = [
  'Status changed from open to in_progress',
  'Priority updated to high',
  'Issue created',
  'Asset assigned to user',
  'User logged in',
  'Workflow transitioned',
]
for (let i = 0; i < 80; i++) {
  auditLog.push({
    id: crypto.randomUUID(),
    actor: SEED_ACTORS[i % SEED_ACTORS.length],
    actorId: `user-${i % 5 + 1}`,
    action: SEED_ACTIONS[i % SEED_ACTIONS.length],
    module: SEED_MODULES[i % SEED_MODULES.length],
    entityId: `${SEED_MODULES[i % SEED_MODULES.length].toUpperCase().slice(0, 3)}-${String(i + 1).padStart(3, '0')}`,
    detail: SEED_DETAILS[i % SEED_DETAILS.length],
    before: i % 3 === 0 ? JSON.stringify({ status: 'open' }) : null,
    after: i % 3 === 0 ? JSON.stringify({ status: 'in_progress' }) : null,
    ip: `192.168.1.${(i % 50) + 10}`,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 15).toISOString(),
  })
}

module.exports = { createAuditLog, getAuditLogs, getEntityLogs }
