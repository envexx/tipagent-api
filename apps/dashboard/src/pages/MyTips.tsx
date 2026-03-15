import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleDollarSign, Clock, CheckCircle, AlertCircle, ExternalLink, Zap, TrendingUp } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { GlassCard, StatCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'

interface Tip {
  id: number
  projectId: number
  githubRepo: string
  eventType: string
  amountUsdt: string
  status: string
  txHash: string | null
  reasoning: string
  createdAt: number
  confirmedAt: number | null
}

interface TipStats {
  totalTips: number
  totalUsdt: number
  pendingTips: number
  pendingUsdt: number
  projectsContributed: number
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export function MyTips() {
  const [tips, setTips] = useState<Tip[]>([])
  const [stats, setStats] = useState<TipStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<{ tips: Tip[] }>('/api/contributor/my-tips'),
      apiFetch<TipStats>('/api/contributor/my-tips/stats')
    ])
      .then(([tipsRes, statsRes]) => {
        setTips(tipsRes.tips)
        setStats(statsRes)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#666' }}>
      Loading your tips...
    </div>
  )

  return (
    <motion.div className="page-container" variants={stagger} initial="hidden" animate="visible">

      {/* Hero */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <GlassCard hover={false} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="hero-card">
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: 12 }}>
                <GradientText>My Tips</GradientText>
              </h1>
              <p style={{ color: '#999', fontSize: '1rem', lineHeight: 1.6 }}>
                Track all the tips you've earned from contributing to open source projects.
              </p>
            </div>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
              background: 'linear-gradient(135deg, rgba(0,211,149,0.08), rgba(255,159,67,0.05), transparent)',
            }} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div variants={fadeUp} className="grid-stats">
          <StatCard
            label="Total Earned"
            value={`$${stats.totalUsdt.toFixed(2)}`}
            color="green"
            icon={<CircleDollarSign size={20} color="var(--web3-green)" />}
          />
          <StatCard
            label="Tips Received"
            value={stats.totalTips}
            color="purple"
            icon={<Zap size={20} color="var(--web3-purple)" />}
          />
          <StatCard
            label="Pending"
            value={`$${stats.pendingUsdt.toFixed(2)}`}
            color="orange"
            icon={<Clock size={20} color="var(--web3-orange)" />}
          />
          <StatCard
            label="Projects"
            value={stats.projectsContributed}
            color="blue"
            icon={<TrendingUp size={20} color="var(--web3-blue)" />}
          />
        </motion.div>
      )}

      {/* Tips List */}
      <motion.div variants={fadeUp}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 16 }}>Recent Tips</h2>

        {tips.length === 0 ? (
          <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
            <CircleDollarSign size={48} color="#444" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>No Tips Yet</h3>
            <p style={{ color: '#888', marginBottom: 16 }}>
              Start contributing to projects to earn tips!
            </p>
            <a href="/explore" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
              background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
              color: '#000', fontWeight: 600,
            }}>
              Explore Projects
            </a>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tips.map(tip => (
              <GlassCard key={tip.id} hover={false} style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: tip.status === 'confirmed' ? 'rgba(0,211,149,0.15)' : 'rgba(255,159,67,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {tip.status === 'confirmed'
                          ? <CheckCircle size={18} color="var(--web3-green)" />
                          : <Clock size={18} color="var(--web3-orange)" />
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tip.githubRepo}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          {tip.eventType === 'pr_merged' ? 'PR Merged' : tip.eventType === 'issue_closed' ? 'Issue Closed' : tip.eventType}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 8 }}>
                      {tip.reasoning}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.75rem', color: '#666' }}>
                      <span>{formatDate(tip.createdAt)}</span>
                      {tip.txHash && (
                        <a
                          href={`https://basescan.org/tx/${tip.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--web3-blue)' }}
                        >
                          View TX <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--web3-green)' }}>
                      ${parseFloat(tip.amountUsdt).toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 12, marginTop: 4,
                      background: tip.status === 'confirmed' ? 'rgba(0,211,149,0.15)' : 'rgba(255,159,67,0.15)',
                      color: tip.status === 'confirmed' ? 'var(--web3-green)' : 'var(--web3-orange)',
                    }}>
                      {tip.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
