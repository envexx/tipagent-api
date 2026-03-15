import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ExternalLink, CircleDollarSign, GitBranch, Star } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'

interface PublicProject {
  id: number
  githubRepo: string
  ownerUsername: string
  tipMinUsdt: string
  tipMaxUsdt: string
  tasks?: string | null
  createdAt: number
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export function Explore() {
  const [projects, setProjects] = useState<PublicProject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiFetch<{ projects: PublicProject[] }>('/api/contributor/explore')
      .then(res => setProjects(res.projects))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p =>
    p.githubRepo.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerUsername.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#666' }}>
      Loading projects...
    </div>
  )

  return (
    <motion.div className="page-container" variants={stagger} initial="hidden" animate="visible">

      {/* Hero */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <GlassCard hover={false} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="hero-card">
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: 12 }}>
                <GradientText>Explore Projects</GradientText>
              </h1>
              <p style={{ color: '#999', fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
                Discover open source projects that reward contributors with USDT tips. 
                Merge PRs or close issues to earn automatically!
              </p>
              
              {/* Search */}
              <div style={{ position: 'relative', maxWidth: 400 }}>
                <Search size={18} color="#666" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: '0.95rem', outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
              background: 'linear-gradient(135deg, rgba(0,207,255,0.08), rgba(155,125,255,0.05), transparent)',
            }} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={18} color="var(--web3-orange)" />
          <span style={{ color: '#888', fontSize: '0.9rem' }}>
            <strong style={{ color: '#fff' }}>{projects.length}</strong> Active Projects
          </span>
        </div>
      </motion.div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={fadeUp}>
          <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Search size={48} color="#444" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 8 }}>No Projects Found</h3>
            <p style={{ color: '#888' }}>
              {search ? 'Try a different search term' : 'No active projects available yet'}
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid-projects">
          {filtered.map((project, i) => (
            <motion.div key={project.id} variants={fadeUp}>
              <GlassCard style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `rgba(${i % 3 === 0 ? '0,211,149' : i % 3 === 1 ? '155,125,255' : '0,207,255'},0.15)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <GitBranch size={24} color={i % 3 === 0 ? 'var(--web3-green)' : i % 3 === 1 ? 'var(--web3-purple)' : 'var(--web3-blue)'} />
                  </div>
                  <a
                    href={`https://github.com/${project.githubRepo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 10px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#888', fontSize: '0.75rem', textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} /> View
                  </a>
                </div>

                <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>
                  {project.githubRepo.split('/')[1]}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>
                  {project.githubRepo}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: 12 }}>
                  by @{project.ownerUsername}
                </p>

                {/* Task Preview */}
                {project.tasks && (
                  <div style={{
                    padding: '10px 12px', borderRadius: 8, marginBottom: 12,
                    background: 'rgba(255,159,67,0.06)', border: '1px solid rgba(255,159,67,0.12)',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--web3-orange)', marginBottom: 4, fontWeight: 600 }}>
                      Looking for:
                    </div>
                    <p style={{ 
                      fontSize: '0.8rem', color: '#999', margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', lineHeight: 1.4
                    }}>
                      {project.tasks.split('\n')[0]}
                    </p>
                  </div>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(0,211,149,0.08)', border: '1px solid rgba(0,211,149,0.15)',
                }}>
                  <CircleDollarSign size={18} color="var(--web3-green)" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: 2 }}>Tip Range</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--web3-green)' }}>
                      ${project.tipMinUsdt} - ${project.tipMaxUsdt}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
