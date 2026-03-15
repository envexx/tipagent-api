import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderGit2, Plus, ArrowRight, Lock, Globe, Zap, X } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'

interface Project {
  id: number; githubRepo: string; walletAddress?: string; isActive: boolean
  tipMinUsdt: string; tipMaxUsdt: string; dailyCap: string
  treasury?: { balanceUsdt: string; totalTipped: string; liveBalanceUsdt?: string; ethBalance?: string }
}
interface GitHubRepo {
  id: number; fullName: string; name: string; description: string | null; isPrivate: boolean; url: string
}

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const ICON_BG = ['rgba(0,211,149,0.15)', 'rgba(155,125,255,0.15)', 'rgba(0,207,255,0.15)']
const ICON_CLR = ['var(--web3-green)', 'var(--web3-purple)', 'var(--web3-blue)']

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState('')
  const [creating, setCreating] = useState(false)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)

  const loadProjects = async () => {
    try { setProjects((await apiFetch<{ projects: Project[] }>('/api/projects')).projects) }
    catch (e) { console.error('Failed:', e) }
    finally { setLoading(false) }
  }
  const loadGithubRepos = async () => {
    setLoadingRepos(true)
    try {
      const res = await apiFetch<{ repos: GitHubRepo[] }>('/api/user/github-repos')
      const reg = new Set(projects.map(p => p.githubRepo))
      setGithubRepos(res.repos.filter(r => !reg.has(r.fullName)))
    } catch (e) { console.error('Failed:', e) }
    finally { setLoadingRepos(false) }
  }
  useEffect(() => { loadProjects() }, [])

  const openModal = () => { setShowModal(true); loadGithubRepos() }
  const handleCreate = async () => {
    if (!selectedRepo) return
    setCreating(true)
    try {
      const res = await apiFetch<{ ok: boolean; webhookSetup?: string; depositInstructions?: string[] }>(
        '/api/projects', 
        { method: 'POST', body: JSON.stringify({ githubRepo: selectedRepo }) }
      )
      setSelectedRepo(''); setShowModal(false); loadProjects()
      // Show success message with webhook status
      if (res.webhookSetup === 'auto') {
        alert('✅ Project created!\n\nWebhook automatically configured on GitHub.\nNow fund your treasury to start tipping!')
      }
    } catch (e: any) { alert(e.message || 'Failed to create project') }
    finally { setCreating(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#666' }}>
      Loading projects...
    </div>
  )

  return (
    <motion.div className="page-container"
      variants={stagger} initial="hidden" animate="visible">

      {/* Hero */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <GlassCard hover={false} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="hero-card">
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: 16 }}>
              <GradientText>Projects</GradientText>
            </h1>
            <p style={{ color: '#999', fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
              Connect your GitHub repositories to automatically tip contributors when they merge PRs or close issues.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 5 : -5 }}
                  style={{ width: 48, height: 48, borderRadius: 12, background: ICON_BG[i],
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderGit2 size={24} color={ICON_CLR[i]} />
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
            background: 'linear-gradient(135deg, rgba(155,125,255,0.08), rgba(0,211,149,0.05), transparent)' }} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {projects.length} Project{projects.length !== 1 ? 's' : ''}
        </h2>
        <button onClick={openModal} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
          color: '#000', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
        }}>
          <Plus size={16} /> Add Project
        </button>
      </motion.div>

      {/* Grid */}
      <motion.div variants={fadeUp}>
        {projects.length === 0 ? (
          <GlassCard style={{ textAlign: 'center', padding: '48px 24px' }}>
            <FolderGit2 size={56} color="#444" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>No Projects Yet</h3>
            <p style={{ color: '#888', marginBottom: 24 }}>Add your first GitHub repository to start tipping contributors.</p>
            <button onClick={openModal} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
              color: '#000', fontWeight: 600, cursor: 'pointer',
            }}><Plus size={18} /> Add Project</button>
          </GlassCard>
        ) : (
          <div className="grid-projects">
            {projects.map((p, i) => (
              <Link to={`/projects/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
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
                      background: p.isActive ? 'rgba(0,211,149,0.15)' : 'rgba(255,255,255,0.05)',
                      color: p.isActive ? 'var(--web3-green)' : '#666',
                    }}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>
                    {p.githubRepo.split('/')[1] || p.githubRepo}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 16 }}>{p.githubRepo}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--web3-green)' }}>
                        ${parseFloat(p.treasury?.liveBalanceUsdt ?? p.treasury?.balanceUsdt ?? '0').toFixed(2)}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#666' }}>Treasury Balance</p>
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={16} color="#888" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
            <motion.div whileHover={{ scale: 1.02 }} onClick={openModal} style={{
              height: '100%', minHeight: 200, borderRadius: 16, border: '2px dashed rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={24} color="#888" />
              </div>
              <span style={{ color: '#888', fontWeight: 500 }}>Add New Project</span>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 520, maxHeight: '80vh', overflow: 'auto',
                background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, }}>
              {/* Header */}
              <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 4 }}>Add New Project</h3>
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>Select a GitHub repository to connect</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8,
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888',
                }}><X size={16} /></button>
              </div>
              {/* Body */}
              <div style={{ padding: 24 }}>
                {loadingRepos ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>Loading repositories...</div>
                ) : githubRepos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <FolderGit2 size={40} color="#444" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#888' }}>No available repositories found.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {githubRepos.map(repo => (
                      <motion.div key={repo.id} whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedRepo(repo.fullName)}
                        style={{
                          padding: 16, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                          border: selectedRepo === repo.fullName ? '1px solid var(--web3-green)' : '1px solid rgba(255,255,255,0.08)',
                          background: selectedRepo === repo.fullName ? 'rgba(0,211,149,0.08)' : 'rgba(255,255,255,0.03)',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: repo.isPrivate ? 'rgba(255,159,67,0.15)' : 'rgba(0,207,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {repo.isPrivate ? <Lock size={20} color="var(--web3-orange)" /> : <Globe size={20} color="var(--web3-blue)" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.fullName}</p>
                            {repo.description && (
                              <p style={{ fontSize: '0.8rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.description}</p>
                            )}
                          </div>
                          {selectedRepo === repo.fullName && (
                            <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--web3-green)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Zap size={14} color="#000" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: '16px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setShowModal(false)} style={{
                  padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#999', cursor: 'pointer', fontWeight: 500,
                }}>Cancel</button>
                <button onClick={handleCreate} disabled={creating || !selectedRepo} style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: !selectedRepo ? '#333' : 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
                  color: !selectedRepo ? '#666' : '#000', fontWeight: 600, cursor: selectedRepo ? 'pointer' : 'default',
                  opacity: creating ? 0.7 : 1,
                }}>{creating ? 'Creating...' : 'Add Project'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
