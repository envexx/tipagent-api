import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../App'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const trustBadges = ['Non-custodial', 'Open-source', 'On-chain']

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
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 14,
      background: 'var(--bg-primary)',
    }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0,229,160,0.3)',
        }}
      >
        <Zap size={22} color="#000" />
      </motion.div>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>Loading...</span>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
      padding: '48px 24px',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
      }} />

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-8%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-8%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,255,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 400, position: 'relative' }}
      >
        {/* Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '40px 36px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(0,229,160,0.3)',
            }}>
              <Zap size={24} color="#000" />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>Welcome to TipAgent</h2>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}>
              Sign in with GitHub to start rewarding your open-source contributors automatically.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255,107,157,0.08)',
                color: 'var(--web3-pink)',
                padding: '12px 16px',
                borderRadius: 10,
                marginBottom: 20,
                fontSize: '0.8125rem',
                border: '1px solid rgba(255,107,157,0.18)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: '1rem' }}>⚠</span>
              <span>Login failed: {error.replace(/_/g, ' ')}</span>
            </motion.div>
          )}

          {/* GitHub Button */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '15px 20px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: '0.9375rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
              transition: 'box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(0,229,160,0.06), rgba(56,200,255,0.06))',
              pointerEvents: 'none',
            }} />
            <Github size={20} />
            <span>Continue with GitHub</span>
            <ArrowRight size={15} style={{ marginLeft: 4, opacity: 0.7 }} />
          </motion.button>

          <p style={{
            fontSize: '0.68rem', color: 'var(--text-muted)',
            marginTop: 24, textAlign: 'center', lineHeight: 1.6,
          }}>
            By signing in, you agree to our{' '}
            <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
              Terms of Service
            </span>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20,
        }}>
          {trustBadges.map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500,
            }}>
              <CheckCircle size={12} color="var(--web3-green)" />
              {t}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
