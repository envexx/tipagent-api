import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Users, Wallet, FolderGit2, Plus, ArrowRight, CircleDollarSign } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { GlassCard, StatCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'

type Stats = { totalTips: number; totalUsdt: number; activeUsers: number; todayTips: number }
interface Project {
  id: number; githubRepo: string; isActive: boolean; walletAddress?: string
  treasury?: { balanceUsdt: string; totalTipped: string; liveBalanceUsdt?: string }
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

const ICON_BG = ['rgba(0,211,149,0.15)', 'rgba(155,125,255,0.15)', 'rgba(0,207,255,0.15)']
const ICON_CLR = ['var(--web3-green)', 'var(--web3-purple)', 'var(--web3-blue)']

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalTips: 0, totalUsdt: 0, activeUsers: 0, todayTips: 0 })
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const [s, p] = await Promise.all([
        apiFetch<Stats>('/api/tips/stats'),
        apiFetch<{ projects: Project[] }>('/api/projects'),
      ])
      setStats(s); setProjects(p.projects)
    } catch (e) { console.error('Failed to load dashboard:', e) }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#666' }}>
      Loading dashboard...
    </div>
  )

  const totalTreasury = projects.reduce((s, p) =>
    s + parseFloat(p.treasury?.liveBalanceUsdt ?? p.treasury?.balanceUsdt ?? '0'), 0)

  return (
    <motion.div className="page-container"
      variants={stagger} initial="hidden" animate="visible">

      {/* Hero */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <GlassCard hover={false} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="hero-card" style={{ padding: undefined }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: 16 }}>
              <GradientText>Dashboard</GradientText>
            </h1>
            <p style={{ color: '#999', fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
              Manage your projects, fund treasuries, and automatically tip contributors for their valuable work.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[CircleDollarSign, Zap, TrendingUp].map((Icon, i) => (
                <motion.div key={i} whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
                  style={{ width: 48, height: 48, borderRadius: 12, background: ICON_BG[i],
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} color={ICON_CLR[i]} />
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
            background: 'linear-gradient(135deg, rgba(0,211,149,0.08), rgba(155,125,255,0.05), transparent)',
          }} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid-stats">
        <StatCard label="Total Tips" value={stats.totalTips} color="purple" icon={<Zap size={20} color="var(--web3-purple)" />} />
        <StatCard label="USDT Tipped" value={`$${stats.totalUsdt.toFixed(2)}`} color="green" icon={<CircleDollarSign size={20} color="var(--web3-green)" />} />
        <StatCard label="Contributors" value={stats.activeUsers} color="blue" icon={<Users size={20} color="var(--web3-blue)" />} />
        <StatCard label="Treasury" value={`$${totalTreasury.toFixed(2)}`} color="orange" icon={<Wallet size={20} color="var(--web3-orange)" />} />
      </motion.div>

      {/* Projects */}
      <motion.div variants={fadeUp}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>My Projects</h2>
          <Link to="/projects" style={{ textDecoration: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#999', fontSize: '0.875rem' }}>
              View All <ArrowRight size={16} />
            </span>
          </Link>
        </div>

        {projects.length === 0 ? (
          <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
            <FolderGit2 size={56} color="#444" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>No Projects Yet</h3>
            <p style={{ color: '#888', marginBottom: 24 }}>
              Add your first GitHub repository to start tipping contributors automatically.
            </p>
            <Link to="/projects" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
                color: '#000', fontWeight: 600, cursor: 'pointer',
              }}>
                <Plus size={18} /> Add Project
              </button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid-projects">
            {projects.map((project, i) => (
              <Link to={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
                <GlassCard style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <motion.div whileHover={{ scale: 1.1 }} style={{
                      width: 48, height: 48, borderRadius: 12, background: ICON_BG[i % 3],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FolderGit2 size={24} color={ICON_CLR[i % 3]} />
                    </motion.div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                      background: project.isActive ? 'rgba(0,211,149,0.15)' : 'rgba(255,255,255,0.05)',
                      color: project.isActive ? 'var(--web3-green)' : '#666',
                    }}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>
                    {project.githubRepo.split('/')[1] || project.githubRepo}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 16 }}>{project.githubRepo}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--web3-green)' }}>
                        ${parseFloat(project.treasury?.liveBalanceUsdt ?? project.treasury?.balanceUsdt ?? '0').toFixed(2)}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#666' }}>Treasury Balance</p>
                    </div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ArrowRight size={16} color="#888" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}

            {/* Add Card */}
            <Link to="/projects" style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ scale: 1.02 }} style={{
                height: '100%', minHeight: 200, borderRadius: 16,
                border: '2px dashed rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 12, cursor: 'pointer',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plus size={24} color="#888" />
                </div>
                <span style={{ color: '#888', fontWeight: 500 }}>Add New Project</span>
              </motion.div>
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
