import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, Link2, Wallet, Zap } from 'lucide-react'
import { useAuth } from '../App'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  const handleLogin = () => { window.location.href = `${API_URL}/auth/github` }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: '#666' }}>Loading...</div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 440, width: '100%' }}>
        <GlassCard hover={false} style={{ padding: '48px 40px', textAlign: 'center' }}>
          {/* Logo */}
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Zap size={32} color="#000" />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>
            Welcome to <GradientText>TipAgent</GradientText>
          </h1>
          <p style={{ color: '#888', marginBottom: 32, lineHeight: 1.6 }}>
            Automatically tip your GitHub contributors with USDT when they merge PRs or close issues.
          </p>

          {error && (
            <div style={{
              background: 'rgba(255,107,157,0.1)', color: 'var(--web3-pink)',
              padding: '12px 16px', borderRadius: 12, marginBottom: 24, fontSize: '0.875rem',
              border: '1px solid rgba(255,107,157,0.2)',
            }}>
              Login failed: {error.replace(/_/g, ' ')}
            </div>
          )}

          <button onClick={handleLogin} style={{
            width: '100%', padding: '14px 24px', borderRadius: 12,
            background: '#24292e', color: '#fff', border: 'none',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'background 0.2s',
          }}>
            <Github size={20} />
            Continue with GitHub
          </button>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 16 }}>How it works</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: <Link2 size={22} color="var(--web3-green)" />, label: 'Connect Repo' },
                { icon: <Wallet size={22} color="var(--web3-purple)" />, label: 'Fund Treasury' },
                { icon: <Zap size={22} color="var(--web3-blue)" />, label: 'Auto-Tip' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, margin: '0 auto 8px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{s.icon}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#555', marginTop: 24 }}>
            By signing in, you agree to our Terms of Service
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
