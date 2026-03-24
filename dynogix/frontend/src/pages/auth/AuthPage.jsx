import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/useStore'
import ThreeBackground from '../../components/ui/ThreeBackground'

export default function AuthPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [mode, setMode] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.signup(form)
      setAuth(res.user, res.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 24 }}>
      <ThreeBackground intensity={1.5} />

      {/* Radial glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(127,90,240,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}
      >
        {/* Card */}
        <div className="glass-strong" style={{ padding: 40 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.img
              src="/Dynogixlogo.png"
              alt="DynoGix"
              style={{
                width: 56, height: 56, borderRadius: 16,
                objectFit: 'contain',
                margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(127,90,240,0.4)',
              }}
              animate={{ boxShadow: ['0 0 30px rgba(127,90,240,0.4)', '0 0 50px rgba(127,90,240,0.6)', '0 0 30px rgba(127,90,240,0.4)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              whileHover={{ scale: 1.05 }}
            />

            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: '#E2E8F0', letterSpacing: -1 }}>
              DYno<span className="gradient-text">Gix</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Enterprise Operations Platform</p>
          </div>

          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: 'rgba(15,23,42,0.6)', borderRadius: 10,
            padding: 4, marginBottom: 28,
          }}>
            {['login', 'signup'].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                  background: mode === m ? 'linear-gradient(135deg, #7F5AF0, #6040D0)' : 'transparent',
                  color: mode === m ? 'white' : '#64748B',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Instrument Sans, sans-serif', transition: 'all 0.2s',
                }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout">
              {mode === 'signup' && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 14, overflow: 'hidden' }}>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Full Name</label>
                  <input className="input-field" placeholder="John Doe"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Email</label>
              <input className="input-field" type="email" placeholder="you@company.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {mode === 'signup' && (
                <motion.div key="role" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 14, overflow: 'hidden' }}>
                  <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 6, fontWeight: 600 }}>Role</label>
                  <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={{ cursor: 'pointer' }}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                  color: '#F87171', fontSize: 13 }}>
                {error}
              </motion.div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : <><span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span><ArrowRight size={16} /></>}
            </button>
          </form>


        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#334155' }}>
          DYnoGix © 2024 · Enterprise Operations Platform
        </p>
      </motion.div>
    </div>
  )
}
