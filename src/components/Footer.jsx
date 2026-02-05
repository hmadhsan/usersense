import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">UserSense</span>
            <p className="footer-description">
              The next frontier of product intelligence. Experience your product before your users do.
            </p>
            <div className="footer-signature">
              <span className="signature-label">AI Engine Status</span>
              <div className="status-badge">
                <span className="status-dot-active"></span>
                Processing Interactions
              </div>
            </div>
          </div>


          <div className="footer-links-group">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#how">How it works</a>
              <a href="#vision">Manifesto</a>
              <a href="#demo">Interactive Demo</a>
              <a href="#sdk">Developers</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <a href="#">X (Twitter)</a>
              <a href="#">GitHub</a>
              <a href="#">LinkedIn</a>
              <a href="#">Discord</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 UserSense AI. All rights reserved.</p>
          <div className="footer-status">
            <span className="status-dot"></span>
            Systems Operational
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
