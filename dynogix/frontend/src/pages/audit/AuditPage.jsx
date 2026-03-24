import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Filter, Clock, User, ArrowRight, Shield } from 'lucide-react'

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'TRANSITION', 'ASSIGN', 'LOGIN', 'LOGOUT', 'ROLE_CHANGE']
const MODULES = ['issues', 'assets', 'users', 'roles', 'auth', 'workflow']
const ACTION_COLORS = {
  CREATE: '#2CB67D', UPDATE: '#7F5AF0', DELETE: '#F87171',
  TRANSITION: '#FBBF24', ASSIGN: '#FF7EB6', LOGIN: '#94A3B8',
  LOGOUT: '#64748B', ROLE_CHANGE: '#F59E0B',
}

const MOCK_LOGS = Array.from({ length: 60 }, (_, i) => ({
  id: `LOG-${String(i + 1).padStart(5, '0')}`,
  actor: ['Sarah Chen', 'James Park', 'Maya Patel', 'Alex Turner', 'Raj Sharma', 'Admin'][i % 6],
  action: ACTIONS[i % ACTIONS.length],
  module: MODULES[i % MODULES.length],
  entity_id: `${MODULES[i % MODULES.length].toUpperCase().slice(0, 3)}-${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`,
  detail: [
    'Status changed from open to in_progress',
    'Priority updated from medium to high',
    'New issue created with title "API rate limit bug"',
    'Asset assigned to Sarah Chen',
    'User role changed from user to manager',
    'Logged in from 192.168.1.45',
    'Issue deleted permanently',
    'Workflow transition: resolved → closed',
  ][i % 8],
  ip: `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 254) + 1}`,
  timestamp: new Date(Date.now() - i * 1000 * 60 * 7).toISOString(),
  before: i % 3 === 0 ? { status: 'open', priority: 'medium' } : null,
  after: i % 3 === 0 ? { status: 'in_progress', priority: 'high' } : null,
}))

function ActionBadge({ action }) {
  const color = ACTION_COLORS[action] || '#64748B'
  return (
    <span className="font-mono" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: `${color}20`, color, border: `1px solid ${color}40` }}>
      {action}
    </span>
  )
}

function DiffBlock({ before, after }) {
  if (!before || !after) return null
  return (
    <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {Object.keys(after).map(key => (
        before[key] !== after[key] && (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <span className="font-mono" style={{ color: '#64748B' }}>{key}:</span>
            <span className="font-mono" style={{ color: '#F87171', textDecoration: 'line-through' }}>{before[key]}</span>
            <ArrowRight size={10} color="#64748B" />
            <span className="font-mono" style={{ color: '#2CB67D' }}>{after[key]}</span>
          </div>
        )
      ))}
    </div>
  )
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const PAGE_SIZE = 20
  const [page, setPage] = useState(1)

  const filtered = MOCK_LOGS.filter(l => {
    const matchSearch = l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.entity_id.includes(search.toUpperCase()) || l.detail.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'all' || l.action === actionFilter
    const matchModule = moduleFilter === 'all' || l.module === moduleFilter
    return matchSearch && matchAction && matchModule
  })

  const paginated = filtered.slice(0, page * PAGE_SIZE)

  const stats = {
    total: MOCK_LOGS.length,
    today: MOCK_LOGS.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    creates: MOCK_LOGS.filter(l => l.action === 'CREATE').length,
    transitions: MOCK_LOGS.filter(l => l.action === 'TRANSITION').length,
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(127,90,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#9D7FF5" />
        </div>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>Audit Logs</h1>
          <p style={{ color: '#64748B', fontSize: 13 }}>Immutable record of all system actions</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: stats.total, color: '#9D7FF5' },
          { label: 'Today', value: stats.today, color: '#2CB67D' },
          { label: 'Creates', value: stats.creates, color: '#FF7EB6' },
          { label: 'Transitions', value: stats.transitions, color: '#FBBF24' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass" style={{ padding: '14px 18px' }}>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(127,90,240,0.15)', borderRadius: 10, padding: '8px 14px' }}>
          <Search size={14} color="#64748B" />
          <input className="input-field" placeholder="Search by actor, entity, detail..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
        </div>
        <select className="input-field" value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="input-field" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Modules</option>
          {MODULES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
      </div>

      {/* Log timeline */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(127,90,240,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2CB67D', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: '#64748B' }}>{filtered.length} events · real-time</span>
        </div>

        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {paginated.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.01 }}
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              style={{ padding: '12px 20px', borderBottom: '1px solid rgba(127,90,240,0.06)', cursor: 'pointer', transition: 'background 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(127,90,240,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Timeline dot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACTION_COLORS[log.action] || '#64748B' }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <ActionBadge action={log.action} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#7F5AF0,#FF7EB6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>
                      {log.actor.charAt(0)}
                    </div>
                    <span style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 500 }}>{log.actor}</span>
                  </div>

                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{log.detail}</span>

                  <span className="font-mono" style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'rgba(127,90,240,0.1)', color: '#7F5AF0' }}>
                    {log.module}
                  </span>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span className="font-mono" style={{ fontSize: 10, color: '#475569' }}>{log.ip}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
                    <Clock size={11} />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Expanded diff */}
              {expanded === log.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  style={{ marginLeft: 20, marginTop: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(127,90,240,0.1)' }}>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                    Entity: <span className="font-mono" style={{ color: '#9D7FF5' }}>{log.entity_id}</span> ·
                    IP: <span className="font-mono" style={{ color: '#9D7FF5' }}>{log.ip}</span> ·
                    Full timestamp: <span className="font-mono" style={{ color: '#9D7FF5' }}>{new Date(log.timestamp).toISOString()}</span>
                  </div>
                  <DiffBlock before={log.before} after={log.after} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {paginated.length < filtered.length && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <button onClick={() => setPage(p => p + 1)} className="btn-ghost" style={{ fontSize: 13 }}>
              Load more ({filtered.length - paginated.length} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
