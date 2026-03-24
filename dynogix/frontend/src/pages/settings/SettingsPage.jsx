import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Key, Palette, Globe, Database, Bot, Save, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../store/useStore'

const TABS = [
  { id: 'profile', label: 'Profile', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Key },
  { id: 'ai', label: 'AI Settings', icon: Bot },
  { id: 'system', label: 'System', icon: Database },
]

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, background: value ? 'linear-gradient(135deg,#7F5AF0,#6040D0)' : 'rgba(30,41,59,0.8)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(127,90,240,0.08)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: '#E2E8F0', fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ marginLeft: 20 }}>{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', timezone: 'UTC', language: 'en' })
  const [notifs, setNotifs] = useState({ email: true, browser: true, issues: true, assets: false, mentions: true, digest: false })
  const [aiSettings, setAiSettings] = useState({ provider: 'anthropic', model: 'claude-sonnet-4-20250514', temperature: 0.7, insights: true, autoSuggest: true })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>Settings</h1>
        <p style={{ color: '#64748B', fontSize: 13, marginTop: 3 }}>Configure your DYnoGix workspace</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Sidebar tabs */}
        <div className="glass" style={{ padding: '8px', height: 'fit-content' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', marginBottom: 2 }}>
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          className="glass" style={{ padding: 28 }}>
          {activeTab === 'profile' && (
            <div>
              <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>Profile Settings</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: 20, borderRadius: 12, background: 'rgba(127,90,240,0.08)', border: '1px solid rgba(127,90,240,0.15)' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#7F5AF0,#FF7EB6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>
                  {profile.name.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0' }}>{profile.name}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: '#7F5AF0', marginTop: 2 }}>{user?.role?.toUpperCase()}</div>
                </div>
                <button className="btn-ghost" style={{ marginLeft: 'auto', fontSize: 13 }}>Change Avatar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'John Doe' },
                  { label: 'Email', key: 'email', placeholder: 'you@company.com' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <input className="input-field" value={profile[key]} placeholder={placeholder} onChange={e => setProfile({ ...profile, [key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Timezone</label>
                  <select className="input-field" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Language</label>
                  <select className="input-field" value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>Notifications</h2>
              <SettingRow label="Email Notifications" description="Receive updates via email">
                <Toggle value={notifs.email} onChange={v => setNotifs({ ...notifs, email: v })} />
              </SettingRow>
              <SettingRow label="Browser Notifications" description="Desktop push notifications">
                <Toggle value={notifs.browser} onChange={v => setNotifs({ ...notifs, browser: v })} />
              </SettingRow>
              <SettingRow label="Issue Updates" description="When issues are created or updated">
                <Toggle value={notifs.issues} onChange={v => setNotifs({ ...notifs, issues: v })} />
              </SettingRow>
              <SettingRow label="Asset Changes" description="Asset assignment and status changes">
                <Toggle value={notifs.assets} onChange={v => setNotifs({ ...notifs, assets: v })} />
              </SettingRow>
              <SettingRow label="Mentions" description="When you're @mentioned">
                <Toggle value={notifs.mentions} onChange={v => setNotifs({ ...notifs, mentions: v })} />
              </SettingRow>
              <SettingRow label="Daily Digest" description="Summary email every morning">
                <Toggle value={notifs.digest} onChange={v => setNotifs({ ...notifs, digest: v })} />
              </SettingRow>
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 6 }}>AI Assistant Settings</h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Configure the DYnoGix AI integration</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>AI Provider</label>
                  <select className="input-field" value={aiSettings.provider} onChange={e => setAiSettings({ ...aiSettings, provider: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="openai">OpenAI (GPT-4)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Model</label>
                  <select className="input-field" value={aiSettings.model} onChange={e => setAiSettings({ ...aiSettings, model: e.target.value })} style={{ cursor: 'pointer' }}>
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                    <option value="claude-opus-4-6">Claude Opus 4.6</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Temperature: {aiSettings.temperature}
                  </label>
                  <input type="range" min="0" max="1" step="0.1" value={aiSettings.temperature}
                    onChange={e => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: '#7F5AF0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    <span>Precise</span><span>Creative</span>
                  </div>
                </div>
              </div>
              <SettingRow label="AI Insights" description="Show AI-generated insights on dashboard">
                <Toggle value={aiSettings.insights} onChange={v => setAiSettings({ ...aiSettings, insights: v })} />
              </SettingRow>
              <SettingRow label="Auto Suggestions" description="AI suggests workflow improvements">
                <Toggle value={aiSettings.autoSuggest} onChange={v => setAiSettings({ ...aiSettings, autoSuggest: v })} />
              </SettingRow>
              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(44,182,125,0.08)', border: '1px solid rgba(44,182,125,0.2)' }}>
                <p style={{ fontSize: 12, color: '#2CB67D' }}>💡 Configure ANTHROPIC_API_KEY in your .env file to activate AI features.</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>Security</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Current Password</label>
                <input className="input-field" type="password" placeholder="••••••••" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>New Password</label>
                  <input className="input-field" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Confirm Password</label>
                  <input className="input-field" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(127,90,240,0.08)', border: '1px solid rgba(127,90,240,0.15)', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#E2E8F0', fontWeight: 600, marginBottom: 8 }}>JWT Token Info</div>
                <div className="font-mono" style={{ fontSize: 11, color: '#64748B' }}>
                  Session expires in 24h · Auto-refresh enabled
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>System</h2>
              {[
                { label: 'Database', value: 'MySQL 8.0 · Connected', color: '#2CB67D' },
                { label: 'Backend', value: 'Node.js v20 · Express 4.x', color: '#2CB67D' },
                { label: 'Cache', value: 'In-Memory · Active', color: '#2CB67D' },
                { label: 'API Version', value: 'v1.0.0', color: '#7F5AF0' },
                { label: 'Build', value: 'React 19 · Vite 6', color: '#7F5AF0' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(127,90,240,0.08)' }}>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>{label}</span>
                  <span className="font-mono" style={{ fontSize: 12, color }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Save button */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120, justifyContent: 'center' }}>
              {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
