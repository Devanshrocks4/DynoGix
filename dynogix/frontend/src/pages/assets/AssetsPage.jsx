import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Package, Laptop, Server, Monitor, Smartphone, HardDrive, ArrowRight, Loader2 } from 'lucide-react'

const ASSET_TYPES = ['laptop', 'server', 'monitor', 'phone', 'storage', 'other']
const ASSET_STATUSES = ['available', 'assigned', 'in_use', 'maintenance', 'retired']
const STATUS_TRANSITIONS = {
  available: ['assigned'],
  assigned: ['in_use', 'available'],
  in_use: ['available', 'maintenance'],
  maintenance: ['available', 'retired'],
  retired: [],
}
const STATUS_COLORS = {
  available: '#2CB67D', assigned: '#7F5AF0', in_use: '#FBBF24',
  maintenance: '#F87171', retired: '#64748B',
}

const ICONS = { laptop: Laptop, server: Server, monitor: Monitor, phone: Smartphone, storage: HardDrive, other: Package }

const MOCK_ASSETS = Array.from({ length: 20 }, (_, i) => ({
  id: `AST-${String(i + 1).padStart(3, '0')}`,
  name: ['MacBook Pro 16"', 'Dell XPS 15', 'HP ProBook 450', 'ThinkPad X1 Carbon', 'Mac Mini M2',
    'Dell PowerEdge R740', 'HP ProLiant DL380', 'Synology NAS DS920+', 'LG 32" 4K Monitor',
    'Samsung Galaxy S24', 'iPhone 15 Pro', 'iPad Pro 12.9"', 'Cisco Catalyst 2960', 'APC UPS 1500VA',
    'Logitech MX Master 3', 'Jabra Evolve2 85', 'Blue Yeti Microphone', 'Anker USB-C Hub',
    'Thunderbolt Dock', 'External SSD 2TB'][i],
  type: ASSET_TYPES[i % 6],
  status: ASSET_STATUSES[i % 5],
  assignee: i % 3 === 0 ? null : ['Sarah Chen', 'James Park', 'Maya Patel', 'Alex Turner', 'Raj Sharma'][i % 5],
  serial: `SN${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
  value: Math.floor(Math.random() * 3000 + 200),
  location: ['HQ Floor 2', 'Remote', 'HQ Floor 1', 'Warehouse', 'HQ Floor 3'][i % 5],
  acquired: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 30).toISOString(),
}))

function AssetCard({ asset, onClick }) {
  const Icon = ICONS[asset.type] || Package
  const color = STATUS_COLORS[asset.status]

  return (
    <motion.div whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(127,90,240,0.2)' }}
      onClick={() => onClick(asset)} className="glass" style={{ padding: 18, cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'DM Mono, monospace', background: `${color}20`, color, border: `1px solid ${color}40` }}>
          {asset.status.replace('_', ' ')}
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</div>
      <div className="font-mono" style={{ fontSize: 11, color: '#64748B', marginBottom: 8 }}>{asset.id}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: '#64748B' }}>{asset.location}</span>
        {asset.assignee ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #7F5AF0, #FF7EB6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>{asset.assignee.charAt(0)}</div>
            <span style={{ color: '#94A3B8' }}>{asset.assignee.split(' ')[0]}</span>
          </div>
        ) : <span style={{ color: '#475569' }}>Unassigned</span>}
      </div>
    </motion.div>
  )
}

function AssetDetailPanel({ asset, onClose, onTransition }) {
  const transitions = STATUS_TRANSITIONS[asset.status] || []
  const Icon = ICONS[asset.type] || Package
  const color = STATUS_COLORS[asset.status]

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ position: 'fixed', right: 0, top: 60, bottom: 0, width: 400, zIndex: 200, background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(30px)', borderLeft: '1px solid rgba(127,90,240,0.2)', overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>

      <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>{asset.name}</h2>
      <div className="font-mono" style={{ fontSize: 12, color: '#7F5AF0', marginBottom: 20 }}>{asset.id} · {asset.serial}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Status', value: <span style={{ color, textTransform: 'capitalize', fontWeight: 600 }}>{asset.status.replace('_', ' ')}</span> },
          { label: 'Type', value: <span style={{ textTransform: 'capitalize' }}>{asset.type}</span> },
          { label: 'Assignee', value: asset.assignee || 'Unassigned' },
          { label: 'Location', value: asset.location },
          { label: 'Value', value: `$${asset.value.toLocaleString()}` },
          { label: 'Acquired', value: new Date(asset.acquired).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(30,41,59,0.6)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4, fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 13, color: '#CBD5E1' }}>{value}</div>
          </div>
        ))}
      </div>

      {transitions.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 10 }}>WORKFLOW TRANSITIONS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {transitions.map(s => (
              <button key={s} onClick={() => onTransition(asset.id, s)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: `${STATUS_COLORS[s]}20`, border: `1px solid ${STATUS_COLORS[s]}40`, color: STATUS_COLORS[s], fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                <ArrowRight size={13} />
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function AssetsPage() {
  const [assets, setAssets] = useState(MOCK_ASSETS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search)
    const matchType = typeFilter === 'all' || a.type === typeFilter
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const handleTransition = (id, newStatus) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  const stats = {
    total: assets.length,
    available: assets.filter(a => a.status === 'available').length,
    assigned: assets.filter(a => a.status === 'assigned' || a.status === 'in_use').length,
    value: assets.reduce((s, a) => s + a.value, 0),
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>Asset Management</h1>
          <p style={{ color: '#64748B', fontSize: 13, marginTop: 3 }}>Track, assign and manage company assets</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Assets', value: stats.total, color: '#9D7FF5' },
          { label: 'Available', value: stats.available, color: '#2CB67D' },
          { label: 'In Use', value: stats.assigned, color: '#FBBF24' },
          { label: 'Total Value', value: `$${(stats.value / 1000).toFixed(0)}k`, color: '#FF7EB6' },
        ].map(({ label, value, color }) => (
          <motion.div key={label} whileHover={{ y: -2 }} className="glass" style={{ padding: '14px 18px' }}>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(127,90,240,0.15)', borderRadius: 10, padding: '8px 14px' }}>
          <Search size={14} color="#64748B" />
          <input className="input-field" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', padding: 0, boxShadow: 'none' }} />
        </div>
        <select className="input-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Types</option>
          {ASSET_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          {ASSET_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {filtered.map((asset, i) => (
          <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <AssetCard asset={asset} onClick={setSelected} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && <AssetDetailPanel asset={selected} onClose={() => setSelected(null)} onTransition={handleTransition} />}
      </AnimatePresence>
    </div>
  )
}
