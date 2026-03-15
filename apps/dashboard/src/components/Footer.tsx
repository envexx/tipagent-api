export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <span style={{ color: 'var(--accent-green)' }}>💸</span>
            </div>
          </div>
          <div className="footer-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub
            </a>
            <a href="#" className="footer-link">
              Documentation
            </a>
            <a href="#" className="footer-link">
              Terms of use
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
