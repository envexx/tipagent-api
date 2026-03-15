import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderGit2, Wallet, LogOut, Zap, Compass, CircleDollarSign } from 'lucide-react'

interface NavbarProps {
  user: { githubUsername: string; avatarUrl?: string } | null
  onLogout: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100, height: 64,
      background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#000" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>TipAgent</span>
        </Link>

        {/* Navigation */}
        {user && (
          <div className="nav-links">
            {/* Owner Section */}
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500,
                color: isActive('/dashboard') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/dashboard') ? 'var(--bg-card)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <LayoutDashboard size={15} />
                Dashboard
              </div>
            </Link>
            <Link to="/projects" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500,
                color: isActive('/projects') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/projects') ? 'var(--bg-card)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <FolderGit2 size={15} />
                Projects
              </div>
            </Link>
            
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            
            {/* Contributor Section */}
            <Link to="/explore" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500,
                color: isActive('/explore') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/explore') ? 'var(--bg-card)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <Compass size={15} />
                Explore
              </div>
            </Link>
            <Link to="/my-tips" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500,
                color: isActive('/my-tips') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/my-tips') ? 'var(--bg-card)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <CircleDollarSign size={15} />
                My Tips
              </div>
            </Link>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div className="wallet-badge">
                <Wallet size={14} color="var(--web3-green)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--web3-green)', fontWeight: 500 }}>Connected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <img
                    src={user.avatarUrl || `https://github.com/${user.githubUsername}.png`}
                    alt=""
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: isActive('/profile') ? '2px solid var(--web3-green)' : '2px solid rgba(255,255,255,0.1)',
                      objectFit: 'cover', cursor: 'pointer',
                    }}
                  />
                </Link>
                <button
                  onClick={onLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '10px 20px', borderRadius: 20, border: 'none',
                background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue))',
                color: '#000', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              }}>
                Connect GitHub
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
