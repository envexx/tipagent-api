import { Link } from 'react-router-dom'
import { Zap, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(8,8,16,0.6)',
      padding: '40px 24px 32px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 40, flexWrap: 'wrap', marginBottom: 32,
        }}>

          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={14} color="#000" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.02em' }}>
                TipAgent
              </span>
            </Link>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
              Automatically reward open-source contributors with USDT — powered by AI and GitHub webhooks.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <div>
              <p style={{
                fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
              }}>Product</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Features', href: '/#features' },
                  { label: 'How it works', href: '/#how-it-works' },
                  { label: 'Get Started', href: '/login' },
                ].map(({ label, href }) => (
                  <Link key={label} to={href} style={{
                    fontSize: '0.82rem', color: 'var(--text-muted)',
                    textDecoration: 'none', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >{label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p style={{
                fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
              }}>Resources</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Documentation', href: '#' },
                  { label: 'GitHub', href: 'https://github.com', external: true },
                  { label: 'Terms of Service', href: '#' },
                ].map(({ label, href, external }) => (
                  external ? (
                    <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                      fontSize: '0.82rem', color: 'var(--text-muted)',
                      textDecoration: 'none', transition: 'color 0.15s',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Github size={12} />{label}
                    </a>
                  ) : (
                    <a key={label} href={href} style={{
                      fontSize: '0.82rem', color: 'var(--text-muted)',
                      textDecoration: 'none', transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >{label}</a>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} TipAgent. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--web3-green)',
              boxShadow: '0 0 6px var(--web3-green)',
            }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Non-custodial · Open-source · On-chain
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
