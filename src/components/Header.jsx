import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <a href="/" className="logo">
            <span className="logo-text">UserSense</span>
          </a>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="#how" className="nav-link">How it works</a>
            <a href="#vision" className="nav-link">Manifesto</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>
          <div className="nav-actions">
            <a href="#cta" className="btn btn-primary">
              Get Early Access
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
