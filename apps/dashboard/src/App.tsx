import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useEffect, useState } from 'react'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { ProjectDetail } from './pages/ProjectDetail'
import { Login } from './pages/Login'
import { Landing } from './pages/Landing'
import { Profile } from './pages/Profile'
import { Explore } from './pages/Explore'
import { MyTips } from './pages/MyTips'
import { AuthCallback } from './pages/AuthCallback'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { apiFetch, clearSessionToken } from './lib/api'

interface User {
  id: number
  githubUsername: string
  displayName?: string
  avatarUrl?: string
  walletAddr?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {} })

export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ user: User | null }>('/auth/me')
      .then(res => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
    clearSessionToken() // Clear localStorage token
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '50vh', color: 'var(--text-muted)'
      }}>
        Loading...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppContent() {
  const { user, logout } = useAuth()
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar user={user} onLogout={logout} />
      <main style={{ flex: 1, paddingBottom: 32 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/my-tips" element={<ProtectedRoute><MyTips /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
