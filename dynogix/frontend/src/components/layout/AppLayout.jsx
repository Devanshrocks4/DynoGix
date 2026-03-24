import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Bug, Package, BarChart3, FileText,
  Shield, Settings, Zap, ChevronLeft, ChevronRight,
  Bell, Search, LogOut, Bot, User
} from 'lucide-react'
import Footer from './Footer'
import { useAuthStore, useUIStore } from '../../store/useStore'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/issues', label: 'Issues', icon: Bug },
  { path: '/assets', label: 'Assets', icon: Package },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/audit', label: 'Audit Logs', icon: FileText },
  { path: '/roles', label: 'Roles & Users', icon: Shield, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout({ children }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, setAiChatOpen, aiChatOpen } = useUIStore()

  const isAdmin = user?.role === 'admin'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flexShrink: 0,
          background: 'rgba(15,23,42,0.95)',
          borderRight: '1px solid rgba(127,90,240,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 100,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(127,90,240,0.15)', minHeight: 72 }}>
          <AnimatePresence>
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <motion.img
                  src="/Dynogixlogo.png"
                  alt="DynoGix"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    objectFit: 'contain', flexShrink: 0,
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
                <div>
                  <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>
                    DYno<span className="gradient-text">Gix</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: 10, color: '#64748B', letterSpacing: 1 }}>ENTERPRISE</div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.img
                  src="/Dynogixlogo.png"
                  alt="DynoGix"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    objectFit: 'contain',
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_ITEMS.filter(i => !i.adminOnly || isAdmin).map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path)
            return (
              <Link key={path} to={path} className={`nav-item ${active ? 'active' : ''}`}
                style={{ marginBottom: 2, whiteSpace: 'nowrap', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }} style={{ overflow: 'hidden' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}

          {/* AI Assistant button */}
          <div style={{ marginTop: 8, borderTop: '1px solid rgba(127,90,240,0.1)', paddingTop: 8 }}>
            <button
              onClick={() => setAiChatOpen(!aiChatOpen)}
              className="nav-item"
              style={{
                width: '100%', border: 'none', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                background: aiChatOpen ? 'rgba(127,90,240,0.15)' : 'transparent',
                color: aiChatOpen ? '#9D7FF5' : '#64748B',
              }}
            >
              <Bot size={18} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    AI Assistant
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* User section */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(127,90,240,0.15)' }}>
          <AnimatePresence>
            {sidebarOpen ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7F5AF0, #FF7EB6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'User'}
                  </div>
                  <div className="font-mono" style={{ fontSize: 10, color: '#7F5AF0' }}>{user?.role?.toUpperCase()}</div>
                </div>
                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
                  <LogOut size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7F5AF0, #FF7EB6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
            width: 24, height: 24, borderRadius: '50%',
            background: '#1E293B', border: '1px solid rgba(127,90,240,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#9D7FF5', zIndex: 110,
          }}
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </motion.aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Top bar */}
        <header style={{
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', borderBottom: '1px solid rgba(127,90,240,0.1)',
          background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)',
          flexShrink: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(127,90,240,0.15)',
            borderRadius: 10, padding: '6px 14px', width: 280,
          }}>
            <Search size={14} color="#64748B" />
            <input placeholder="Search anything..." className="input-field"
              style={{ background: 'none', border: 'none', padding: 0, boxShadow: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

function NotificationBell() {
  const { notifications } = useUIStore()
  return (
    <button style={{
      position: 'relative', background: 'rgba(30,41,59,0.6)',
      border: '1px solid rgba(127,90,240,0.15)', borderRadius: 10,
      padding: '8px 10px', cursor: 'pointer', color: '#64748B',
    }}>
      <Bell size={16} />
      {notifications.length > 0 && (
        <span style={{
          position: 'absolute', top: 6, right: 6, width: 8, height: 8,
          background: '#FF7EB6', borderRadius: '50%',
        }} />
      )}
    </button>
  )
}
