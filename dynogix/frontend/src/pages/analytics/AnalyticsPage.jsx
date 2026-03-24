import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Zap, Target, Clock, CheckCircle } from 'lucide-react'

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

const MONTHLY = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => ({
  month,
  created: Math.floor(Math.random() * 40) + 10,
  resolved: Math.floor(Math.random() * 35) + 8,
  avg_time: Math.floor(Math.random() * 48) + 12,
}))

const TEAM_DATA = [
  { name: 'Sarah Chen', resolved: 34, open: 4, avg: 1.2 },
  { name: 'James Park', resolved: 28, open: 6, avg: 2.1 },
  { name: 'Maya Patel', resolved: 41, open: 2, avg: 0.9 },
  { name: 'Alex Turner', resolved: 19, open: 8, avg: 3.4 },
  { name: 'Raj Sharma', resolved: 22, open: 5, avg: 1.8 },
]

const RADAR_DATA = [
  { subject: 'Speed', A: 85, B: 65 },
  { subject: 'Quality', A: 90, B: 80 },
  { subject: 'Volume', A: 70, B: 75 },
  { subject: 'Collab', A: 80, B: 60 },
  { subject: 'SLA', A: 95, B: 70 },
]

const WORKFLOW_TIMES = [
  { stage: 'Open → In Progress', avg: 4.2, target: 2, p95: 12 },
  { stage: 'In Progress → Resolved', avg: 18.6, target: 24, p95: 72 },
  { stage: 'Resolved → Closed', avg: 2.1, target: 4, p95: 8 },
]

const KPI_CARDS = [
  { icon: CheckCircle, label: 'Resolution Rate', value: '87%', change: +5.2, color: '#2CB67D' },
  { icon: Clock, label: 'Avg Resolution Time', value: '22.8h', change: -8.4, color: '#7F5AF0' },
  { icon: Target, label: 'SLA Compliance', value: '94.1%', change: +2.1, color: '#FF7EB6' },
  { icon: Zap, label: 'Workflow Velocity', value: '3.4x', change: +12.0, color: '#FBBF24' },
]

export default function AnalyticsPage() {
  return (
    <div style={{ padding: 28 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>Analytics</h1>
        <p style={{ color: '#64748B', fontSize: 13, marginTop: 3 }}>Performance insights & operational intelligence</p>
      </motion.div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {KPI_CARDS.map(({ icon: Icon, label, value, change, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="glass" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700,
                color: change > 0 ? '#2CB67D' : '#F87171' }}>
                {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(change)}%
              </div>
            </div>
            <div className="font-display" style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Monthly trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass" style={{ padding: 20 }}>
          <div style={{ marginBottom: 18 }}>
            <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>Issue Volume Trends</h3>
            <p style={{ fontSize: 12, color: '#64748B' }}>Monthly created vs resolved</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7F5AF0" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7F5AF0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2CB67D" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2CB67D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="created" name="Created" stroke="#7F5AF0" fill="url(#created)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#2CB67D" fill="url(#resolved)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Team radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass" style={{ padding: 20 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>Team Performance</h3>
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>This vs last month</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(127,90,240,0.15)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
              <Radar name="This Month" dataKey="A" stroke="#7F5AF0" fill="#7F5AF0" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Last Month" dataKey="B" stroke="#2CB67D" fill="#2CB67D" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 2" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Team leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass" style={{ padding: 20 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 16 }}>User Productivity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TEAM_DATA.sort((a, b) => b.resolved - a.resolved).map((member, i) => (
              <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: ['linear-gradient(135deg,#FBBF24,#F59E0B)', 'linear-gradient(135deg,#94A3B8,#64748B)', 'linear-gradient(135deg,#B45309,#92400E)', 'linear-gradient(135deg,#7F5AF0,#6040D0)', 'linear-gradient(135deg,#2CB67D,#16A34A)'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 500 }}>{member.name}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: '#2CB67D' }}>{member.resolved} resolved</span>
                  </div>
                  <div style={{ background: 'rgba(127,90,240,0.1)', borderRadius: 4, height: 4 }}>
                    <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#7F5AF0,#2CB67D)', width: `${(member.resolved / 45) * 100}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: '#64748B', width: 40, textAlign: 'right' }}>{member.avg}h avg</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Workflow times */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass" style={{ padding: 20 }}>
          <h3 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 16 }}>Workflow Stage Times</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {WORKFLOW_TIMES.map((wf) => {
              const onTarget = wf.avg <= wf.target
              return (
                <div key={wf.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{wf.stage}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontSize: 11, color: onTarget ? '#2CB67D' : '#F87171' }}>{wf.avg}h avg</span>
                      <span className="font-mono" style={{ fontSize: 10, color: '#64748B' }}>target: {wf.target}h</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <div style={{ flex: 1, background: 'rgba(30,41,59,0.8)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${Math.min(100, (wf.avg / wf.p95) * 100)}%`, background: onTarget ? 'linear-gradient(90deg,#2CB67D,#40D494)' : 'linear-gradient(90deg,#F87171,#FBBF24)', transition: 'width 0.8s ease' }} />
                    </div>
                    {onTarget
                      ? <span style={{ fontSize: 10, color: '#2CB67D', flexShrink: 0 }}>✓ on target</span>
                      : <span style={{ fontSize: 10, color: '#F87171', flexShrink: 0 }}>⚠ over target</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 10, background: 'rgba(127,90,240,0.08)', border: '1px solid rgba(127,90,240,0.15)' }}>
            <div style={{ fontSize: 12, color: '#9D7FF5', fontWeight: 600, marginBottom: 4 }}>💡 AI Insight</div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
              "In Progress → Resolved" stage is 5.4h below target this month — a 22% improvement. Consider applying similar workflow optimizations to other stages.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
