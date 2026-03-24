import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Check, X, Edit2, Crown, UserCheck, User } from 'lucide-react'
import { rolesAPI, usersAPI } from '../../services/api'
import { useAuthStore } from '../../store/useStore'

const PERMISSIONS = [
  { id: 'issues.view', label: 'View Issues', module: 'Issues' },
  { id: 'issues.create', label: 'Create Issues', module: 'Issues' },
  { id: 'issues.update', label: 'Update Issues', module: 'Issues' },
  { id: 'issues.delete', label: 'Delete Issues', module: 'Issues' },
  { id: 'issues.assign', label: 'Assign Issues', module: 'Issues' },
  { id: 'assets.view', label: 'View Assets', module: 'Assets' },
  { id: 'assets.manage', label: 'Manage Assets', module: 'Assets' },
  { id: 'audit.view', label: 'View Audit Logs', module: 'Audit' },
  { id: 'roles.manage', label: 'Manage Roles', module: 'Roles' },
  { id: 'users.manage', label: 'Manage Users', module: 'Users' },
  { id: 'analytics.view', label: 'View Analytics', module: 'Analytics' },
  { id: 'workflows.configure', label: 'Configure Workflows', module: 'Workflows' },
]

const ROLE_ICONS = { admin: Crown, manager: UserCheck, user: User }
const ROLE_COLORS = { admin: '#FBBF24', manager: '#7F5AF0', user: '#2CB67D' }

const modules = [...new Set(PERMISSIONS.map(p => p.module))]

function RoleCard({ role, selected, onClick }) {
  const Icon = ROLE_ICONS[role.id] || Shield
  return (
    <motion.div whileHover={{ y: -2 }} onClick={() => onClick(role)}
      className="glass"
      style={{ padding: 18, cursor: 'pointer', border: `1px solid ${selected ? role.color + '60' : 'rgba(127,90,240,0.2)'}`, background: selected ? `${role.color}08` : undefined, transition: 'all 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${role.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={role.color} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>{role.name}</div>
          <div className="font-mono" style={{ fontSize: 11, color: '#64748B' }}>{(role.users || 0)} users</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{role.description || 'No description'}</p>
      <div style={{ fontSize: 11, color: role.color }}>
        {Array.isArray(role.permissions) ? role.permissions.length : 0} / {PERMISSIONS.length} permissions
      </div>
    </motion.div>
  )
}

function EditUserModal({ user, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({ name: '', status: 'active' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      setFormData({ name: user.name || '', status: user.status || 'active' })
    }
  }, [isOpen, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(user.id, formData)
      onClose()
    } catch (error) {
      alert('Failed to update user: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass"
        style={{ maxWidth: 420, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(127,90,240,0.2)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E2E8F0' }}>Edit User</h3>
          <button onClick={onClose} style={{ color: '#64748B', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
            <input
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(127,90,240,0.3)', borderRadius: 8, background: 'rgba(30,41,59,0.8)', color: '#E2E8F0', fontSize: 14 }}
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6, fontWeight: 500 }}>Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(127,90,240,0.3)', borderRadius: 8, background: 'rgba(30,41,59,0.8)', color: '#E2E8F0', fontSize: 14 }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#7F5AF0,#6040D0)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#64748B', border: '1px solid rgba(127,90,240,0.3)', borderRadius: 8, fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function RolesPage() {
  const { user: authUser } = useAuthStore()
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [tab, setTab] = useState('roles')
  const [editingPerms, setEditingPerms] = useState(false)
  const [draftPerms, setDraftPerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [rolesRes, usersRes] = await Promise.all([
          rolesAPI.getAll(),
          usersAPI.getAll()
        ])
        setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes.roles || [])
        setUsers(Array.isArray(usersRes) ? usersRes : usersRes.users || [])
        if (Array.isArray(rolesRes) && rolesRes.length > 0) {
          setSelectedRole(rolesRes[0])
        }
      } catch (err) {
        setError(err.message || 'Failed to load data')
        console.error('Roles load error:', err)
        // Fallback mock data
        setRoles([
          { id: 'admin', name: 'Admin', description: 'Full access', permissions: ['all'], users: 1 },
          { id: 'manager', name: 'Manager', description: 'Team access', permissions: [], users: 3 },
          { id: 'user', name: 'User', description: 'Basic access', permissions: [], users: 10 }
        ])
        setUsers([
          { id: '1', name: 'Admin User', email: 'admin@dynogix.com', role: 'admin', status: 'active', joined: '2024-01-01' },
          { id: '2', name: 'Sarah Chen', email: 'sarah@dynogix.com', role: 'manager', status: 'active', joined: '2024-02-15' }
        ])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleEditPerms = () => {
    setDraftPerms([...(selectedRole.permissions || [])])
    setEditingPerms(true)
  }

  const togglePerm = (id) => {
    setDraftPerms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const savePerms = async () => {
    try {
      await rolesAPI.updatePermissions(selectedRole.id, draftPerms)
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? { ...r, permissions: draftPerms } : r))
      setSelectedRole(prev => ({ ...prev, permissions: draftPerms }))
    } catch (err) {
      alert('Failed to save permissions: ' + (err.message || 'Unknown error'))
    }
    setEditingPerms(false)
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert('Failed to update role: ' + err.message)
    }
  }

  const updateUser = async (userId, data) => {
    try {
      await usersAPI.update(userId, data)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u))
    } catch (err) {
      throw err
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 16 }}>
        Loading roles & users...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#F87171' }}>
        Error loading data: {error} <br />
        <span style={{ fontSize: 12, color: '#64748B' }}>Using fallback data</span>
      </div>
    )
  }

  const isAdmin = authUser?.role === 'admin'

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#FBBF24" />
        </div>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>Roles & Access</h1>
          <p style={{ color: '#64748B', fontSize: 13 }}>Manage permissions and user roles {isAdmin && '(Admin)'} </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(15,23,42,0.6)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[
          { id: 'roles', label: 'Roles & Permissions', icon: Shield }, 
          { id: 'users', label: 'Users', icon: Users }
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', border: 'none', 
              borderRadius: 8, background: tab === id ? 'linear-gradient(135deg,#7F5AF0,#6040D0)' : 'transparent', 
              color: tab === id ? 'white' : '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer', 
              fontFamily: 'Instrument Sans, sans-serif', transition: 'all 0.2s' 
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roles.map(role => (
              <RoleCard key={role.id} role={role} selected={selectedRole?.id === role.id} onClick={setSelectedRole} />
            ))}
          </div>

          {selectedRole && (
            <motion.div key={selectedRole.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>
                    {selectedRole.name} Permissions
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {(editingPerms ? draftPerms : selectedRole.permissions || []).length} active permissions
                  </p>
                </div>
                {isAdmin && !editingPerms ? (
                  <button onClick={handleEditPerms} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px', background: 'transparent', border: '1px solid rgba(127,90,240,0.3)', color: '#9D7FF5', borderRadius: 6 }}>
                    <Edit2 size={13} /> Edit
                  </button>
                ) : isAdmin && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditingPerms(false)} style={{ fontSize: 13, padding: '8px 14px', background: 'transparent', border: '1px solid rgba(127,90,240,0.3)', color: '#9D7FF5', borderRadius: 6 }}>Cancel</button>
                    <button onClick={savePerms} style={{ fontSize: 13, padding: '8px 14px', background: 'linear-gradient(135deg,#7F5AF0,#6040D0)', color: 'white', borderRadius: 6, border: 'none' }}>Save Changes</button>
                  </div>
                )}
              </div>

              {modules.map(mod => (
                <div key={mod} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#7F5AF0', fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                    {mod}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PERMISSIONS.filter(p => p.module === mod).map(perm => {
                      const active = (editingPerms ? draftPerms : selectedRole.permissions || []).includes(perm.id)
                      return (
                        <button key={perm.id}
                          onClick={() => editingPerms && isAdmin && togglePerm(perm.id)}
                          disabled={!editingPerms || !isAdmin}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, 
                            fontSize: 12, fontWeight: 500, cursor: editingPerms && isAdmin ? 'pointer' : 'default', 
                            transition: 'all 0.15s ease', 
                            background: active ? `${(ROLE_COLORS[selectedRole.id] || '#7F5AF0')}20` : 'rgba(30,41,59,0.6)', 
                            border: `1px solid ${active ? (ROLE_COLORS[selectedRole.id] || '#7F5AF0') + '60' : 'rgba(127,90,240,0.1)'}`, 
                            color: active ? (ROLE_COLORS[selectedRole.id] || '#7F5AF0') : '#64748B', 
                            fontFamily: 'Instrument Sans, sans-serif',
                            opacity: (!editingPerms || !isAdmin) ? 0.5 : 1
                          }}>
                          {active ? <Check size={12} /> : <X size={12} />}
                          {perm.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 24, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(127,90,240,0.15)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '16px 12px', textAlign: 'left', fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const roleColor = ROLE_COLORS[user.role] || '#64748B'
                return (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid rgba(127,90,240,0.06)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(127,90,240,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${roleColor},#FF7EB6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span className="font-mono" style={{ fontSize: 12, color: '#64748B' }}>{user.email}</span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <select value={user.role || 'user'} onChange={e => updateUserRole(user.id, e.target.value)} disabled={!isAdmin}
                        style={{ 
                          background: `${roleColor}15`, border: `1px solid ${roleColor}40`, borderRadius: 6, 
                          padding: '6px 12px', color: roleColor, fontSize: 12, fontWeight: 600, 
                          cursor: isAdmin ? 'pointer' : 'default', fontFamily: 'Instrument Sans', outline: 'none',
                          opacity: isAdmin ? 1 : 0.6
                        }}>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 8px', borderRadius: 20, background: user.status === 'active' ? 'rgba(44,182,125,0.1)' : 'rgba(100,116,139,0.1)', color: user.status === 'active' ? '#2CB67D' : '#64748B' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.status === 'active' ? '#2CB67D' : '#64748B' }} />
                        {user.status || 'unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: 12, color: '#64748B' }}>
                      {user.joined ? new Date(user.joined).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button onClick={() => setEditingUser(user)} disabled={!isAdmin} style={{ background: 'none', border: 'none', color: isAdmin ? '#64748B' : '#9CA3AF', cursor: isAdmin ? 'pointer' : 'default', padding: 4, opacity: isAdmin ? 1 : 0.5 }}>
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          <EditUserModal
            user={editingUser}
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            onSave={updateUser}
          />
        </motion.div>
      )}
    </div>
  )
}

