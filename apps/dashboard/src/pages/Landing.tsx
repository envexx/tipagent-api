import { forwardRef, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, GitMerge, Wallet, Shield, Clock, ArrowRight,
  Github, Bot, TrendingUp, Users, Code, Star,
  CheckCircle, Globe, Lock, Cpu, User
} from 'lucide-react'
import { GradientText } from '../components/ui/GradientText'
import { AnimatedBeam } from '../components/ui/AnimatedBeam'
import { useAuth } from '../App'

const features = [
  {
    icon: <Bot size={22} />,
    color: 'var(--web3-green)',
    bg: 'rgba(0,211,149,0.1)',
    border: 'rgba(0,211,149,0.15)',
    title: 'AI-Powered Evaluation',
    desc: 'Gemini AI analyzes every PR and issue to determine a fair tip amount based on the complexity and impact of each contribution.',
  },
  {
    icon: <GitMerge size={22} />,
    color: 'var(--web3-blue)',
    bg: 'rgba(0,207,255,0.1)',
    border: 'rgba(0,207,255,0.15)',
    title: 'Auto-Tip on Merge',
    desc: 'Tips are automatically sent when a PR is merged or an issue is closed via GitHub webhook — with zero manual intervention.',
  },
  {
    icon: <Wallet size={22} />,
    color: 'var(--web3-purple)',
    bg: 'rgba(155,125,255,0.1)',
    border: 'rgba(155,125,255,0.15)',
    title: 'USDT Treasury',
    desc: 'Project funds are securely held in treasury. Fund it once, and tips are automatically distributed proportionally to all contributors.',
  },
  {
    icon: <Lock size={22} />,
    color: 'var(--web3-pink)',
    bg: 'rgba(255,107,157,0.1)',
    border: 'rgba(255,107,157,0.15)',
    title: 'Non-Custodial',
    desc: 'You stay in control of your funds. TipAgent only executes transfers that are pre-approved according to your project rules.',
  },
  {
    icon: <Clock size={22} />,
    color: 'var(--web3-orange)',
    bg: 'rgba(255,159,67,0.1)',
    border: 'rgba(255,159,67,0.15)',
    title: 'Instant On-Chain',
    desc: 'On-chain USDT is transferred directly to contributors\' wallets within minutes of an event occurring.',
  },
  {
    icon: <Globe size={22} />,
    color: 'var(--web3-green)',
    bg: 'rgba(0,211,149,0.1)',
    border: 'rgba(0,211,149,0.15)',
    title: 'Multi-Source Trigger',
    desc: 'Supports GitHub webhooks, Discord notifications, and custom triggers for maximum flexibility.',
  },
]

const steps = [
  {
    num: '01',
    color: 'var(--web3-green)',
    icon: <Github size={20} />,
    title: 'Connect Repository',
    desc: 'Log in via GitHub and register your open-source repository in a matter of seconds.',
  },
  {
    num: '02',
    color: 'var(--web3-purple)',
    icon: <Wallet size={20} />,
    title: 'Fund the Treasury',
    desc: 'Deposit USDT into your project treasury. Set the maximum tip limit and distribution rules.',
  },
  {
    num: '03',
    color: 'var(--web3-blue)',
    icon: <Cpu size={20} />,
    title: 'AI Evaluates Contributions',
    desc: 'Every PR/issue is evaluated by AI to objectively determine the value of each contribution.',
  },
  {
    num: '04',
    color: 'var(--web3-orange)',
    icon: <Zap size={20} />,
    title: 'Tips Sent Automatically',
    desc: 'USDT goes directly to the contributor\'s wallet. No manual process required.',
  },
]

const stats = [
  { value: 'Automated', label: '100% tipping process', color: 'var(--web3-green)' },
  { value: 'AI', label: 'evaluates every contribution', color: 'var(--web3-blue)' },
  { value: 'USDT', label: 'on-chain payments', color: 'var(--web3-purple)' },
  { value: 'Open', label: 'source & non-custodial', color: 'var(--web3-orange)' },
]

const whyItems = [
  {
    icon: <TrendingUp size={18} />,
    color: 'var(--web3-green)',
    title: 'Contributors stay motivated',
    desc: 'Real rewards in USDT encourage contributors to be more active and produce higher-quality work.',
  },
  {
    icon: <Users size={18} />,
    color: 'var(--web3-blue)',
    title: 'Community grows stronger',
    desc: 'Projects that pay their contributors attract more talented developers.',
  },
  {
    icon: <Code size={18} />,
    color: 'var(--web3-purple)',
    title: 'Zero overhead for maintainers',
    desc: 'No need to manually review who deserves a tip. AI and webhooks handle everything for you.',
  },
  {
    icon: <Star size={18} />,
    color: 'var(--web3-orange)',
    title: 'Fair & transparent',
    desc: 'All tips are recorded on-chain. Contributors can view their payment history transparently.',
  },
]

// ── Beam Diagram ────────────────────────────────────────────────────

const NodeBox = forwardRef<HTMLDivElement, {
  icon: React.ReactNode
  label: string
  color: string
  sublabel?: string
  large?: boolean
}>(({ icon, label, color, sublabel, large }, ref) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
    <div
      ref={ref}
      style={{
        width: large ? 68 : 52,
        height: large ? 68 : 52,
        borderRadius: large ? 20 : 14,
        background: `${color}14`,
        border: `1.5px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
        position: 'relative', zIndex: 1,
        boxShadow: `0 0 18px ${color}20`,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
    {sublabel && (
      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.6 }}>{sublabel}</span>
    )}
  </div>
))
NodeBox.displayName = 'NodeBox'

function FlowDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const ownerRef    = useRef<HTMLDivElement>(null)
  const githubRef   = useRef<HTMLDivElement>(null)
  const walletRef   = useRef<HTMLDivElement>(null)
  const aiRef       = useRef<HTMLDivElement>(null)
  const c1Ref       = useRef<HTMLDivElement>(null)
  const c2Ref       = useRef<HTMLDivElement>(null)
  const c3Ref       = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: 340 }}
    >
      {/* Layout: 3 columns */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%', padding: '16px 8px',
      }}>

        {/* Left — Sources */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'center',
          height: '100%',
        }}>
          <NodeBox ref={ownerRef} icon={<User size={22} />} label="Owner" sublabel="maintainer" color="var(--web3-green)" />
          <NodeBox ref={githubRef} icon={<Github size={22} />} label="GitHub" sublabel="webhook" color="var(--web3-blue)" />
          <NodeBox ref={walletRef} icon={<Wallet size={22} />} label="Treasury" sublabel="USDT" color="var(--web3-purple)" />
        </div>

        {/* Center — TipAgent AI */}
        <NodeBox ref={aiRef} icon={<Zap size={28} />} label="TipAgent AI" color="var(--web3-green)" large />

        {/* Right — Contributors */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'center',
          height: '100%',
        }}>
          <NodeBox ref={c1Ref} icon={<User size={20} />} label="@alice" sublabel="+$12 USDT" color="var(--web3-orange)" />
          <NodeBox ref={c2Ref} icon={<User size={20} />} label="@bob" sublabel="+$8 USDT" color="var(--web3-orange)" />
          <NodeBox ref={c3Ref} icon={<User size={20} />} label="@carol" sublabel="+$5 USDT" color="var(--web3-orange)" />
        </div>
      </div>

      {/* Beams: sources → AI */}
      <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLDivElement>} fromRef={ownerRef as React.RefObject<HTMLDivElement>} toRef={aiRef as React.RefObject<HTMLDivElement>} color="var(--web3-green)" duration={3.5} delay={0} />
      <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLDivElement>} fromRef={githubRef as React.RefObject<HTMLDivElement>} toRef={aiRef as React.RefObject<HTMLDivElement>} color="var(--web3-blue)" duration={3.5} delay={0.7} />
      <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLDivElement>} fromRef={walletRef as React.RefObject<HTMLDivElement>} toRef={aiRef as React.RefObject<HTMLDivElement>} color="var(--web3-purple)" duration={3.5} delay={1.4} />

      {/* Beams: AI → contributors */}
      <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLDivElement>} fromRef={aiRef as React.RefObject<HTMLDivElement>} toRef={c1Ref as React.RefObject<HTMLDivElement>} color="var(--web3-green)" duration={3.5} delay={0.4} reverse />
      <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLDivElement>} fromRef={aiRef as React.RefObject<HTMLDivElement>} toRef={c2Ref as React.RefObject<HTMLDivElement>} color="var(--web3-blue)" duration={3.5} delay={1.1} reverse />
      <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLDivElement>} fromRef={aiRef as React.RefObject<HTMLDivElement>} toRef={c3Ref as React.RefObject<HTMLDivElement>} color="var(--web3-purple)" duration={3.5} delay={1.8} reverse />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────

export function Landing() {
  const { user } = useAuth()

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 100 }}>
        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: -100, left: '30%',
          width: 700, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,211,149,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 80, right: -60,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,125,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="hero-split" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

          {/* ── Left: Text ── */}
          <div className="hero-split-text">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 100,
                background: 'rgba(0,211,149,0.08)',
                border: '1px solid rgba(0,211,149,0.2)',
                fontSize: '0.8rem', color: 'var(--web3-green)', fontWeight: 600,
              }}>
                <Zap size={13} />
                Automated Contributor Rewards
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}
            >
              Reward your
              <br />
              <GradientText>open-source contributors</GradientText>
              <br />
              automatically.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontSize: '1.05rem', color: '#888', lineHeight: 1.8,
                maxWidth: 480, margin: '0 0 36px',
              }}
            >
              TipAgent is an AI agent that automatically sends USDT to GitHub contributors
              when they merge a PR or close an issue — without a single manual click from you.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ display: 'flex', gap: 14, justifyContent: 'flex-start', flexWrap: 'wrap' }}
            >
              <Link to={user ? '/dashboard' : '/login'}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '13px 28px', borderRadius: 50, border: 'none',
                    background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
                    color: '#000', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 0 40px rgba(0,211,149,0.25)',
                  }}
                >
                  <Github size={17} />
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '13px 28px', borderRadius: 50,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Code size={17} />
                  View Source
                </motion.button>
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', justifyContent: 'flex-start', gap: 20, marginTop: 32, flexWrap: 'wrap' }}
            >
              {['Non-custodial', 'Open-source', 'On-chain payments', 'AI-powered'].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.76rem', color: '#555',
                }}>
                  <CheckCircle size={12} color="var(--web3-green)" />
                  {t}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Flow Diagram ── */}
          <motion.div
            className="hero-split-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 24,
              padding: '8px 16px',
              backdropFilter: 'blur(8px)',
            }}>
              <FlowDiagram />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)',
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }} className="stats-grid">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center', padding: '8px 0' }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY TIPAGENT ── */}
      <section style={{ padding: '90px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--web3-green)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
            Why TipAgent exists?
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
            Open-source deserves more than<br />
            <GradientText>just a "thank you"</GradientText>
          </h2>
          <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            Thousands of developers contribute to open-source projects every day without compensation.
            TipAgent is here to change that — making financial rewards a natural part
            of the development workflow.
          </p>
        </motion.div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20,
        }} className="why-grid">
          {whyItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex', gap: 16, padding: '24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 6, fontSize: '0.95rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: '90px 24px',
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--web3-blue)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Key Features
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2 }}>
              Everything you need<br />
              <GradientText>is already here</GradientText>
            </h2>
          </motion.div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          }} className="features-grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ borderColor: f.border, y: -4 }}
                style={{
                  padding: '28px 24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 16,
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 18,
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '90px 24px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--web3-purple)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
            How It Works
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2 }}>
            Set up in <GradientText>4 steps</GradientText>
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex', gap: 24, padding: '28px 32px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                marginBottom: i < steps.length - 1 ? 4 : 0,
                position: 'relative',
              }}
            >
              {/* Number */}
              <div style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.color,
                }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: step.color, letterSpacing: 1 }}>{step.num}</span>
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', bottom: -4, left: 55,
                  width: 2, height: 8,
                  background: 'rgba(255,255,255,0.06)',
                }} />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: '90px 24px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,211,149,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={26} color="#000" />
          </div>

          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
            Start rewarding your contributors<br />
            <GradientText>today. For free.</GradientText>
          </h2>

          <p style={{ color: '#666', fontSize: '1rem', lineHeight: 1.8, marginBottom: 40 }}>
            No credit card required. No complex setup.
            Connect your GitHub and TipAgent is ready to go.
          </p>

          <Link to={user ? '/dashboard' : '/login'}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '16px 40px', borderRadius: 50, border: 'none',
                background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
                color: '#000', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                boxShadow: '0 0 60px rgba(0,211,149,0.2)',
              }}
            >
              <Github size={20} />
              {user ? 'Go to Dashboard' : 'Connect GitHub — Free'}
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <p style={{ color: '#444', fontSize: '0.78rem', marginTop: 24 }}>
            Non-custodial · Open-source · On-chain · Powered by AI
          </p>
        </motion.div>
      </section>

      {/* Responsive */}
      <style>{`
        /* Hero two-column */
        .hero-split {
          display: flex;
          align-items: center;
          gap: 56px;
        }
        .hero-split-text {
          flex: 1;
          min-width: 0;
        }
        .hero-split-visual {
          width: 420px;
          flex-shrink: 0;
        }
        @media (max-width: 1000px) {
          .hero-split { flex-direction: column; gap: 48px; text-align: center; }
          .hero-split-text { text-align: center; }
          .hero-split-text .motion-div { justify-content: center !important; }
          .hero-split-visual { width: 100%; max-width: 460px; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .hero-split-visual { max-width: 360px; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-split-visual { max-width: 100%; }
        }
      `}</style>
    </div>
  )
}
