import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Wallet, Settings, Link2, Copy, Check, CircleDollarSign, Fuel, TrendingUp, ExternalLink, Edit3, Save, X, FileText } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { GlassCard, StatCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'

interface Project {
  id: number; githubRepo: string; webhookSecret: string; walletAddress: string
  isActive: boolean; tipMinUsdt: string; tipMaxUsdt: string; dailyCap: string; cooldownHours: string
  tasks?: string | null
}
interface Treasury {
  balanceUsdt: string; aaveUsdt: string; totalDeposited: string; totalTipped: string
  liveBalanceUsdt?: string; ethBalance?: string
}
interface WebhookSetup { webhookUrl: string; webhookSecret: string; instructions: string[] }

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [treasury, setTreasury] = useState<Treasury | null>(null)
  const [webhookSetup, setWebhookSetup] = useState<WebhookSetup | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWebhook, setShowWebhook] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  
  // Edit states
  const [editingRules, setEditingRules] = useState(false)
  const [editingTasks, setEditingTasks] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    tipMinUsdt: '', tipMaxUsdt: '', dailyCap: '', cooldownHours: '', tasks: ''
  })

  useEffect(() => {
    if (!id) return
    Promise.all([
      apiFetch<{ project: Project; treasury: Treasury }>(`/api/projects/${id}`),
      apiFetch<WebhookSetup>(`/api/projects/${id}/webhook-setup`)
    ]).then(([proj, wh]) => {
      setProject(proj.project); setTreasury(proj.treasury); setWebhookSetup(wh)
      setEditForm({
        tipMinUsdt: proj.project.tipMinUsdt,
        tipMaxUsdt: proj.project.tipMaxUsdt,
        dailyCap: proj.project.dailyCap,
        cooldownHours: proj.project.cooldownHours,
        tasks: proj.project.tasks || ''
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label); setTimeout(() => setCopied(null), 2000)
  }
  
  const saveRules = async () => {
    if (!id) return
    setSaving(true)
    try {
      const res = await apiFetch<{ ok: boolean; project: Project }>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          tipMinUsdt: editForm.tipMinUsdt,
          tipMaxUsdt: editForm.tipMaxUsdt,
          dailyCap: editForm.dailyCap,
          cooldownHours: editForm.cooldownHours
        })
      })
      setProject(res.project)
      setEditingRules(false)
    } catch (e: any) { alert(e.message || 'Failed to save') }
    finally { setSaving(false) }
  }
  
  const saveTasks = async () => {
    if (!id) return
    setSaving(true)
    try {
      const res = await apiFetch<{ ok: boolean; project: Project }>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ tasks: editForm.tasks })
      })
      setProject(res.project)
      setEditingTasks(false)
    } catch (e: any) { alert(e.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#666' }}>Loading project...</div>
  )
  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--web3-pink)' }}>Project not found</div>
  )

  const row = (label: string, val: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{val}</span>
    </div>
  )

  return (
    <motion.div className="page-container"
      variants={stagger} initial="hidden" animate="visible">

      {/* Hero */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <GlassCard hover={false} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="hero-card">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#999', fontSize: '0.875rem', textDecoration: 'none', marginBottom: 16 }}>
              <ArrowLeft size={16} /> Back to Projects
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
              <GradientText>{project.githubRepo.split('/')[1] || project.githubRepo}</GradientText>
            </h1>
            <a href={`https://github.com/${project.githubRepo}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--web3-green)', fontSize: '0.9rem' }}>
              github.com/{project.githubRepo} <ExternalLink size={14} />
            </a>
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
            background: 'linear-gradient(135deg, rgba(0,211,149,0.08), rgba(155,125,255,0.05), transparent)' }} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid-stats">
        <StatCard label="USDT Balance" value={`$${treasury?.liveBalanceUsdt ?? '0.00'}`} color="green" icon={<CircleDollarSign size={20} color="var(--web3-green)" />} />
        <StatCard label="ETH (Gas)" value={treasury?.ethBalance ?? '0.000000'} color="blue" icon={<Fuel size={20} color="var(--web3-blue)" />} />
        <StatCard label="In Aave" value={`$${parseFloat(treasury?.aaveUsdt ?? '0').toFixed(2)}`} color="purple" icon={<TrendingUp size={20} color="var(--web3-purple)" />} />
        <StatCard label="Total Tipped" value={`$${parseFloat(treasury?.totalTipped ?? '0').toFixed(2)}`} color="orange" icon={<Wallet size={20} color="var(--web3-orange)" />} />
      </motion.div>

      <div className="grid-detail">
        {/* Deposit Wallet */}
        <motion.div variants={fadeUp} className="grid-detail-full">
          <GlassCard hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,211,149,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={20} color="var(--web3-green)" />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Deposit Wallet</h3>
            </div>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 16 }}>
              Send USDT and ETH to this address to fund your project treasury.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Wallet Address (Base Network)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <code style={{ color: 'var(--web3-green)', fontSize: '0.85rem', wordBreak: 'break-all', flex: 1 }}>
                  {project.walletAddress}
                </code>
                <button onClick={() => copyText(project.walletAddress, 'wallet')} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: copied === 'wallet' ? 'var(--web3-green)' : '#999', cursor: 'pointer', fontSize: '0.8rem',
                }}>
                  {copied === 'wallet' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
            <p style={{ color: '#666', fontSize: '0.85rem' }}>
              <strong style={{ color: '#ccc' }}>How to fund:</strong> Send USDT + small amount of ETH (0.001-0.01) for gas fees.
            </p>
          </GlassCard>
        </motion.div>

        {/* Tip Rules */}
        <motion.div variants={fadeUp}>
          <GlassCard hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(155,125,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings size={20} color="var(--web3-purple)" />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Tip Rules</h3>
              </div>
              {!editingRules && (
                <button onClick={() => setEditingRules(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#999', cursor: 'pointer', fontSize: '0.8rem',
                }}><Edit3 size={14} /> Edit</button>
              )}
            </div>
            
            {editingRules ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 6 }}>Min Tip ($)</label>
                    <input type="number" step="0.1" value={editForm.tipMinUsdt}
                      onChange={e => setEditForm({ ...editForm, tipMinUsdt: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 6 }}>Max Tip ($)</label>
                    <input type="number" step="0.1" value={editForm.tipMaxUsdt}
                      onChange={e => setEditForm({ ...editForm, tipMaxUsdt: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 6 }}>Daily Cap ($)</label>
                    <input type="number" step="1" value={editForm.dailyCap}
                      onChange={e => setEditForm({ ...editForm, dailyCap: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: 6 }}>Cooldown (hours)</label>
                    <input type="number" step="0.5" value={editForm.cooldownHours}
                      onChange={e => setEditForm({ ...editForm, cooldownHours: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button onClick={() => setEditingRules(false)} disabled={saving} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#888', cursor: 'pointer', fontSize: '0.85rem',
                  }}><X size={14} /> Cancel</button>
                  <button onClick={saveRules} disabled={saving} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
                    background: 'var(--web3-purple)', border: 'none',
                    color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  }}><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <>
                {row('Min Tip', `$${project.tipMinUsdt}`)}
                {row('Max Tip', `$${project.tipMaxUsdt}`)}
                {row('Daily Cap', `$${project.dailyCap}`)}
                {row('Cooldown', `${project.cooldownHours}h`)}
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* Webhook */}
        <motion.div variants={fadeUp}>
          <GlassCard hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,207,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={20} color="var(--web3-blue)" />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Webhook</h3>
              </div>
              <button onClick={() => setShowWebhook(!showWebhook)} style={{
                padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#999', cursor: 'pointer', fontSize: '0.8rem',
              }}>{showWebhook ? 'Hide' : 'Show'}</button>
            </div>

            {showWebhook && webhookSetup ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Webhook URL</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ color: 'var(--web3-green)', fontSize: '0.8rem', wordBreak: 'break-all', flex: 1 }}>{webhookSetup.webhookUrl}</code>
                    <button onClick={() => copyText(webhookSetup.webhookUrl, 'url')} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: copied === 'url' ? 'var(--web3-green)' : '#666',
                    }}>{copied === 'url' ? <Check size={16} /> : <Copy size={16} />}</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Secret</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={{ color: 'var(--web3-orange)', fontSize: '0.8rem', wordBreak: 'break-all', flex: 1 }}>{webhookSetup.webhookSecret}</code>
                    <button onClick={() => copyText(webhookSetup.webhookSecret, 'secret')} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: copied === 'secret' ? 'var(--web3-green)' : '#666',
                    }}>{copied === 'secret' ? <Check size={16} /> : <Copy size={16} />}</button>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#888', fontSize: '0.85rem' }}>Configure GitHub webhook to enable automatic tipping.</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Task Priorities */}
        <motion.div variants={fadeUp} className="grid-detail-full">
          <GlassCard hover={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,159,67,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="var(--web3-orange)" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Task Priorities</h3>
                  <p style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
                    Describe work priorities for AI to evaluate tips
                  </p>
                </div>
              </div>
              {!editingTasks && (
                <button onClick={() => setEditingTasks(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#999', cursor: 'pointer', fontSize: '0.8rem',
                }}><Edit3 size={14} /> Edit</button>
              )}
            </div>
            
            {editingTasks ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea
                  value={editForm.tasks}
                  onChange={e => setEditForm({ ...editForm, tasks: e.target.value })}
                  placeholder={`Describe what work should be rewarded and how much. Example:

HIGH PRIORITY ($30-50):
- Fix critical security bugs
- Implement new major features
- Performance optimizations

MEDIUM PRIORITY ($10-30):
- Bug fixes
- Documentation improvements
- Test coverage

LOW PRIORITY ($1-10):
- Typo fixes
- Minor UI tweaks`}
                  style={{
                    width: '100%', minHeight: 200, padding: 16, borderRadius: 12,
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#666' }}>
                  💡 The AI will use these priorities to determine tip amounts. Be specific about what work is most valuable to your project.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setEditingTasks(false); setEditForm({ ...editForm, tasks: project.tasks || '' }) }} disabled={saving} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#888', cursor: 'pointer', fontSize: '0.85rem',
                  }}><X size={14} /> Cancel</button>
                  <button onClick={saveTasks} disabled={saving} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
                    background: 'var(--web3-orange)', border: 'none',
                    color: '#000', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  }}><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              project.tasks ? (
                <pre style={{
                  background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 10,
                  color: '#ccc', fontSize: '0.85rem', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>{project.tasks}</pre>
              ) : (
                <div style={{ 
                  background: 'rgba(255,159,67,0.05)', padding: 20, borderRadius: 10,
                  border: '1px dashed rgba(255,159,67,0.3)', textAlign: 'center'
                }}>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 12 }}>
                    No task priorities set yet.
                  </p>
                  <p style={{ color: '#666', fontSize: '0.8rem' }}>
                    Add task descriptions to help the AI determine appropriate tip amounts for different types of contributions.
                  </p>
                </div>
              )
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
