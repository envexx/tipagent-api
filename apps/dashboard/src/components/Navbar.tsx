import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderGit2, Wallet, LogOut, Zap, Compass, CircleDollarSign, Github } from 'lucide-react'

interface NavbarProps {
  user: { githubUsername: string; avatarUrl?: string } | null
  onLogout: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')
  const isLanding = location.pathname === '/'

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 64,
      background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px',
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,229,160,0.2)',
          }}>
            <Zap size={17} color="#000" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.02em' }}>
            TipAgent
          </span>
        </Link>

        {/* Center nav */}
        {user ? (
          /* Logged-in nav links */
          <div className="nav-links">
            {[
              { to: '/dashboard', icon: <LayoutDashboard size={14} />, label: 'Dashboard' },
              { to: '/projects', icon: <FolderGit2 size={14} />, label: 'Projects' },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 500,
                  color: isActive(to) ? '#fff' : 'var(--text-secondary)',
                  background: isActive(to) ? 'rgba(255,255,255,0.07)' : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  {icon}{label}
                </div>
              </Link>
            ))}

            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', margin: '0 2px' }} />

            {[
              { to: '/explore', icon: <Compass size={14} />, label: 'Explore' },
              { to: '/my-tips', icon: <CircleDollarSign size={14} />, label: 'My Tips' },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 8, fontSize: '0.84rem', fontWeight: 500,
                  color: isActive(to) ? '#fff' : 'var(--text-secondary)',
                  background: isActive(to) ? 'rgba(255,255,255,0.07)' : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  {icon}{label}
                </div>
              </Link>
            ))}
          </div>
        ) : isLanding ? (
          /* Landing page anchor links */
          <div className="nav-links-public">
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How it works' },
              { href: '#why', label: 'Why TipAgent' },
            ].map(({ href, label }) => (
              <a key={href} href={href} style={{
                fontSize: '0.84rem', fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '7px 13px', borderRadius: 8,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {label}
              </a>
            ))}
          </div>
        ) : null}

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {user ? (
            <>
              <div className="wallet-badge">
                <Wallet size={13} color="var(--web3-green)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--web3-green)', fontWeight: 600 }}>Connected</span>
              </div>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <img
                  src={user.avatarUrl || `https://github.com/${user.githubUsername}.png`}
                  alt=""
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: isActive('/profile') ? '2px solid var(--web3-green)' : '2px solid rgba(255,255,255,0.1)',
                    objectFit: 'cover', cursor: 'pointer', display: 'block',
                  }}
                />
              </Link>
              <button
                onClick={onLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <LogOut size={13} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
                color: '#000', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer',
                letterSpacing: '-0.01em',
                boxShadow: '0 0 20px rgba(0,229,160,0.15)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <Github size={15} />
                Get Started
              </button>
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .nav-links-public {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        @media (max-width: 680px) {
          .nav-links-public { display: none; }
        }
      `}</style>
    </nav>
  )
}
