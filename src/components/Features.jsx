import './Features.css'

function Features() {
  return (
    <section id="features" className="features-section section">
      <div className="container">
        <div className="features-layout">
          <div className="features-visual">
            <img
              src="/usersense_report_detail.png"
              alt="UserSense Friction Report Detail"
              className="feature-image"
            />
          </div>
          <div className="features-content">
            <span className="section-label">The Barrier</span>
            <h2 className="features-title">Catch friction before it touches a human.</h2>
            <p className="features-description">
              UserSense agents don't just "test" your code—they experience it. Our AI profiles every interaction to ensure your product feels as good as it looks.
            </p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-dot"></span>
                <div>
                  <strong>Contextual Reports</strong>
                  <p>Understand exactly why a user would feel frustrated at any given step.</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <div>
                  <strong>Actionable Fixes</strong>
                  <p>Get specific recommendations and code snippets to resolve UI issues instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
