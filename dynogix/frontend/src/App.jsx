import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useStore'
import AppLayout from './components/layout/AppLayout'
import AiChatPanel from './components/ai/AiChatPanel'
import ThreeBackground from './components/ui/ThreeBackground'
import AuthPage from './pages/auth/AuthPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import IssuesPage from './pages/issues/IssuesPage'
import AssetsPage from './pages/assets/AssetsPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import AuditPage from './pages/audit/AuditPage'
import RolesPage from './pages/roles/RolesPage'
import SettingsPage from './pages/settings/SettingsPage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppShell({ children }) {
  return (
    <div style={{ position: 'relative' }}>
<ThreeBackground intensity={0.2} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <AppLayout>{children}</AppLayout>
        <AiChatPanel />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><AppShell><IssuesPage /></AppShell></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><AppShell><AssetsPage /></AppShell></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AppShell><AnalyticsPage /></AppShell></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><AppShell><AuditPage /></AppShell></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><AppShell><RolesPage /></AppShell></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppShell><SettingsPage /></AppShell></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
