import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, ChevronDown, ArrowRight, Loader2, Bug, AlertCircle, Clock, User } from 'lucide-react'
import { issuesAPI, usersAPI } from '../../services/api'
import { useAuthStore } from '../../store/useStore'

const PRIORITIES = ['critical', 'high', 'medium', 'low']
const STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' }
const STATUS_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved', 'open'],
  resolved: ['closed', 'in_progress'],
  closed: [],
}

const MOCK_ISSUES = Array.from({ length: 18 }, (_, i) => ({
  id: `ISS-${String(i + 100).padStart(3, '0')}`,
  title: [
    'API rate limiting not working correctly',
    'Dashboard charts not loading on mobile',
    'User authentication token expiry bug',
    'Search results returning duplicates',
    'Email notifications delayed by 10+ min',
    'Asset export feature broken in Firefox',
    'Role permissions not saved after refresh',
    'Audit log timestamps showing wrong tz',
    'Memory leak in background workflow job',
    'CSV import fails on large files >10MB',
    'Dark mode toggle breaks on Safari',
    'PDF generation hangs on complex reports',
    'Webhook retries causing duplicate events',
    'Session timeout too aggressive on idle',
    'Bulk action checkbox state not cleared',
    '2FA setup fails on new devices',
    'Sorting by date column broken',
    'Comment notifications not sent to all',
  ][i],
  status: STATUSES[i % 4],
  priority: PRIORITIES[i % 4],
  assignee: ['Sarah Chen', 'James Park', 'Maya Patel', 'Alex Turner', null][i % 5],
  created: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 2).toISOString(),
  tags: [['backend', 'auth'], ['frontend', 'mobile'], ['api'], ['ui', 'bug'], ['notifications']][i % 5],
}))

function PriorityDot({ priority }) {
  const colors = { critical: '#F87171', high: '#FBBF24', medium: '#9D7FF5', low: '#2CB67D' }
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[priority], display: 'inline-block', flexShrink: 0 }} />
}

function StatusBadge({ status }) {
  const cls = { open: 'badge-open', in_progress: 'badge-progress', resolved: 'badge-resolved', closed: 'badge-closed' }
  return <span className={`badge ${cls[status]}`}>{STATUS_LABELS[status]}</span>
}

function IssueRow({ issue, onClick }) {
  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      whileHover={{ background: 'rgba(127,90,240,0.05)' }}
      onClick={() => onClick(issue)} style={{ cursor: 'pointer', borderBottom: '1px solid rgba(127,90,240,0.08)' }}>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PriorityDot priority={issue.priority} />
          <span className="font-mono" style={{ fontSize: 12, color: '#64748B' }}>{issue.id}</span>
        </div>
      </td>
      <td style={{ padding: '12px 16px', maxWidth: 300 }}>
        <div style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {issue.title}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {issue.tags?.map(t => (
            <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(127,90,240,0.1)', color: '#7F5AF0' }}>{t}</span>
          ))}
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}><StatusBadge status={issue.status} /></td>
      <td style={{ padding: '12px 16px' }}>
        <span className={`priority-${issue.priority}`} style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
          {issue.priority}
        </span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        {issue.assignee ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #7F5AF0, #FF7EB6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
              {issue.assignee.charAt(0)}
            </div>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{issue.assignee.split(' ')[0]}</span>
          </div>
        ) : <span style={{ fontSize: 12, color: '#475569' }}>Unassigned</span>}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ fontSize: 11, color: '#64748B' }}>{new Date(issue.created).toLocaleDateString()}</span>
      </td>
    </motion.tr>
  )
}

function CreateIssueModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assignee: '' })
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!form.title) return
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      onCreate({ ...form, id: `ISS-${Date.now()}`, status: 'open', created: new Date().toISOString(), tags: [] })
      setLoading(false)
      onClose()
    }, 800)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="glass-strong" style={{ width: '100%', maxWidth: 500, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(127,90,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bug size={16} color="#9D7FF5" />
          </div>
          <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>New Issue</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Title *</label>
            <input className="input-field" placeholder="Brief description of the issue..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Description</label>
            <textarea className="input-field" placeholder="Detailed description, steps to reproduce..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ cursor: 'pointer' }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Assign to</label>
              <select className="input-field" value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} style={{ cursor: 'pointer' }}>
                <option value="">Unassigned</option>
                {['Sarah Chen', 'James Park', 'Maya Patel', 'Alex Turner'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleCreate} className="btn-primary" disabled={loading || !form.title} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Issue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function IssueDetailPanel({ issue, onClose, onTransition }) {
  const transitions = STATUS_TRANSITIONS[issue.status] || []

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ position: 'fixed', right: 0, top: 60, bottom: 0, width: 420, zIndex: 200, background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(30px)', borderLeft: '1px solid rgba(127,90,240,0.2)', overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <span className="font-mono" style={{ fontSize: 12, color: '#7F5AF0' }}>{issue.id}</span>
          <StatusBadge status={issue.status} />
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>

      <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#E2E8F0', marginBottom: 16, lineHeight: 1.4 }}>{issue.title}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Priority', value: <span className={`priority-${issue.priority}`} style={{ fontWeight: 600, textTransform: 'capitalize' }}>{issue.priority}</span> },
          { label: 'Assigned', value: issue.assignee || 'Unassigned' },
          { label: 'Created', value: new Date(issue.created).toLocaleDateString() },
          { label: 'Tags', value: issue.tags?.join(', ') || '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 13, color: '#CBD5E1' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Workflow transitions */}
      {transitions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 10 }}>WORKFLOW TRANSITIONS</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {transitions.map(s => (
              <button key={s} onClick={() => onTransition(issue.id, s)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(127,90,240,0.15)', border: '1px solid rgba(127,90,240,0.3)', color: '#9D7FF5', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <ArrowRight size={13} />
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workflow timeline */}
      <div>
        <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 10 }}>TIMELINE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { action: 'Issue created', time: issue.created, user: 'System' },
            { action: `Status set to ${issue.status}`, time: new Date(new Date(issue.created).getTime() + 3600000).toISOString(), user: issue.assignee || 'Admin' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 16, position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7F5AF0', flexShrink: 0, marginTop: 3 }} />
                {i < 1 && <div style={{ width: 1, flex: 1, background: 'rgba(127,90,240,0.2)', marginTop: 4 }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#CBD5E1' }}>{e.action}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{e.user} · {new Date(e.time).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function IssuesPage() {
  const [issues, setIssues] = useState(MOCK_ISSUES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)

  const filtered = issues.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search)
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    const matchPriority = priorityFilter === 'all' || i.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const handleTransition = (id, newStatus) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>
            Issue Tracker
          </h1>
          <p style={{ color: '#64748B', fontSize: 13, marginTop: 3 }}>
            {filtered.length} issues · {issues.filter(i => i.status === 'open').length} open
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Issue
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(127,90,240,0.15)', borderRadius: 10, padding: '8px 14px' }}>
          <Search size={14} color="#64748B" />
          <input className="input-field" placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
        </div>
        <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="input-field" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(127,90,240,0.15)' }}>
                {['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Created'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(issue => (
                <IssueRow key={issue.id} issue={issue} onClick={setSelected} />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748B' }}>
            <Bug size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No issues found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreateIssueModal onClose={() => setShowCreate(false)} onCreate={issue => setIssues(p => [issue, ...p])} />}
        {selected && <IssueDetailPanel issue={selected} onClose={() => setSelected(null)} onTransition={handleTransition} />}
      </AnimatePresence>
    </div>
  )
}
