import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Wallet, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { useAuth } from '../App'
import { apiFetch } from '../lib/api'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export function Profile() {
  const { user } = useAuth()
  const [walletAddr, setWalletAddr] = useState(user?.walletAddr || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveWallet = async () => {
    if (!walletAddr || !/^0x[a-fA-F0-9]{40}$/.test(walletAddr)) {
      setMessage({ type: 'error', text: 'Invalid wallet address. Must be a valid Ethereum address (0x...)' })
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      await apiFetch('/api/user/wallet', {
        method: 'PUT',
        body: JSON.stringify({ walletAddr, chain: 'base' })
      })
      setMessage({ type: 'success', text: 'Wallet address saved! You will now receive tips to this address.' })
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to save wallet address' })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <motion.div className="page-container" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      
      {/* Hero */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <GlassCard hover={false} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="hero-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <img
                src={user.avatarUrl || `https://github.com/${user.githubUsername}.png`}
                alt=""
                style={{ width: 80, height: 80, borderRadius: 16, border: '3px solid rgba(255,255,255,0.1)' }}
              />
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4 }}>
                  <GradientText>{user.displayName || user.githubUsername}</GradientText>
                </h1>
                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', fontSize: '0.9rem' }}
                >
                  @{user.githubUsername} <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Wallet Settings */}
      <motion.div variants={fadeUp}>
        <GlassCard hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'rgba(0,211,149,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Wallet size={22} color="var(--web3-green)" />
            </div>
            <div>
              <h2 style={{ fontWeight: 600, fontSize: '1.15rem' }}>Wallet Address</h2>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>Set your wallet to receive tips from projects</p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Your Wallet Address (Base Network)
            </label>
            <input
              type="text"
              value={walletAddr}
              onChange={e => setWalletAddr(e.target.value)}
              placeholder="0x..."
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff', fontSize: '0.95rem', outline: 'none',
              }}
            />
          </div>

          {message && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              background: message.type === 'success' ? 'rgba(0,211,149,0.1)' : 'rgba(255,107,157,0.1)',
              border: `1px solid ${message.type === 'success' ? 'rgba(0,211,149,0.2)' : 'rgba(255,107,157,0.2)'}`,
              color: message.type === 'success' ? 'var(--web3-green)' : 'var(--web3-pink)',
            }}>
              {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span style={{ fontSize: '0.9rem' }}>{message.text}</span>
            </div>
          )}

          <button
            onClick={handleSaveWallet}
            disabled={saving}
            style={{
              padding: '12px 28px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
              color: '#000', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Wallet Address'}
          </button>

          <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: 'rgba(155,125,255,0.08)', border: '1px solid rgba(155,125,255,0.15)' }}>
            <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: 1.6 }}>
              <strong style={{ color: '#fff' }}>How tips work:</strong><br />
              When you merge a PR or close an issue in a project that uses TipAgent, the project owner's treasury will automatically send USDT to your wallet address above.
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
