import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Bug, Package, Users, Activity, ArrowUp, ArrowDown, Clock, Zap } from 'lucide-react'
import { dashboardAPI } from '../../services/api'
import { useAuthStore } from '../../store/useStore'

function StatCard({ icon: Icon, label, value, sub, change, color, delay = 0 }) {
  const positive = change > 0 || false
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass"
      style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: `${color}20`,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}20`, border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 20,
          background: positive ? 'rgba(44,182,125,0.1)' : 'rgba(248,113,113,0.1)',
          color: positive ? '#2CB67D' : '#F87171', fontSize: 12, fontWeight: 600,
        }}>
          {positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {Math.abs(change) || 0}%
        </div>
      </div>
      <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: '#E2E8F0', lineHeight: 1 }}>
        {value || 0}
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{label}</div>
      {sub && <div className="font-mono" style={{ fontSize: 11, color, marginTop: 6 }}>{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong" style={{ padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#9D7FF5', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState([])
  const [statusData, setStatusData] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [statsRes, chartsRes, activityRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getChartData(),
          dashboardAPI.getActivity()
        ])
        setStats(statsRes || {})
        setTrends(chartsRes?.trends || [])
        setStatusData(chartsRes?.status || [])
        setActivity(Array.isArray(activityRes) ? activityRes : activityRes?.activities || [])
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
        console.error('Dashboard load error:', err)
        // Fallback data
        setStats({
          issues: { total: 142, open: 38, resolved: 89, critical: 7, change: 12 },
          assets: { total: 56, assigned: 41, available: 15, change: -3 },
          users: { total: 24, active: 18, change: 6 },
          workflows: { completed: 234, pending: 31, change: 18 }
        })
        setTrends(Array.from({ length: 14 }, (_, i) => ({
          day: `D${i + 1}`,
          issues: Math.floor(Math.random() * 12) + 2,
          resolved: Math.floor(Math.random() * 10) + 1,
          assets: Math.floor(Math.random() * 5) + 1,
        })))
        setStatusData([
          { name: 'Open', value: 38, color: '#2CB67D' },
          { name: 'In Progress', value: 17, color: '#7F5AF0' },
          { name: 'Resolved', value: 89, color: '#FF7EB6' },
          { name: 'Closed', value: 12, color: '#475569' }
        ])
        setActivity([
          { user: 'Sarah Chen', action: 'Resolved issue #ISS-089', time: '2m ago' },
          { user: 'James Park', action: 'Created issue #ISS-142', time: '8m ago' },
          { user: 'Maya Patel', action: 'Assigned asset #AST-023', time: '15m ago' },
          { user: 'Alex Turner', action: 'Updated workflow status', time: '23m ago' },
        ])
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 16 }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={{ padding: 28, minHeight: '100%' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>
          {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          Here's what's happening across your operations today.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            textAlign: 'center',
            marginTop: 16,
            padding: '12px 0',
            fontSize: 16,
            letterSpacing: 0.5,
          }}
        >
          <div className="font-display" style={{ color: '#94A3B8' }}>
            Where Operations Meet Intelligence.
          </div>
        </motion.div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={Bug} label="Total Issues" value={stats?.issues?.total || 0}
          sub={`${stats?.issues?.open || 0} open · ${stats?.issues?.critical || 0} critical`}
          change={stats?.issues?.change || 0} color="#7F5AF0" delay={0.1} />
        <StatCard icon={Package} label="Assets Managed" value={stats?.assets?.total || 0}
          sub={`${stats?.assets?.assigned || 0} assigned`}
          change={stats?.assets?.change || 0} color="#2CB67D" delay={0.15} />
        <StatCard icon={Users} label="Active Users" value={stats?.users?.active || 0}
          sub={`of ${stats?.users?.total || 0} total`}
          change={stats?.users?.change || 0} color="#FF7EB6" delay={0.2} />
        <StatCard icon={Zap} label="Workflows Run" value={stats?.workflows?.completed || 0}
          sub={`${stats?.workflows?.pending || 0} pending`}
          change={stats?.workflows?.change || 0} color="#FBBF24" delay={0.25} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="glass" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>Activity Trends</h3>
              <p style={{ fontSize: 12, color: '#64748B' }}>Last 14 days</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ color: '#7F5AF0', label: 'Created' }, { color: '#2CB67D', label: 'Resolved' }].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B' }}>
                  <div style={{ width: 10, height: 2, background: color, borderRadius: 2 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="violet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7F5AF0" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7F5AF0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2CB67D" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2CB67D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="issues" name="Created" stroke="#7F5AF0" fill="url(#violet)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#2CB67D" fill="url(#mint)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }} className="glass" style={{ padding: 20 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>Issue Status</h3>
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70}
                paddingAngle={3} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {statusData.map(({ name, value, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ color: '#94A3B8' }}>{name}</span>
                </div>
                <span className="font-mono" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="glass" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Activity size={16} color="#9D7FF5" />
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>Live Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.isArray(activity) ? activity.slice(0, 6).map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0',
                  borderBottom: i < 5 ? '1px solid rgba(127,90,240,0.08)' : 'none' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, #7F5AF0, #FF7EB6)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'white',
                }}>
                  {item.user?.charAt(0) || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#CBD5E1' }}>
                    <strong style={{ color: '#E2E8F0' }}>{item.user}</strong> {item.action}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {item.time}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>No activity data</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }} className="glass" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>Weekly Breakdown</h3>
            <p style={{ fontSize: 12, color: '#64748B' }}>Issues vs Assets by day</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trends.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="issues" name="Issues" fill="#7F5AF0" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="assets" name="Assets" fill="#2CB67D" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 20, marginTop: 20, textAlign: 'center', color: '#F87171' }}>
          {error} (using fallback data)
        </motion.div>
      )}
    </div>
  )
}

