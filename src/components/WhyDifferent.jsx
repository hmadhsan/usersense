import './WhyDifferent.css'

function WhyDifferent() {
  return (
    <section className="why-different section">
      <div className="container">
        <div className="why-content">
          <span className="section-label">The Paradigm Shift</span>
          <h2 className="why-title">
            Analytics show history.<br />
            UserSense shows the<br />
            <span className="gradient-text">future of your UX.</span>
          </h2>
          <p className="why-description">
            Traditional tools tell you who left and where. UserSense tells you <strong>why</strong> they were going to leave before you even ship the first byte.
          </p>
          <div className="why-grid">
            <div className="why-item">
              <span className="why-icon">🛡️</span>
              <h3>Proactive</h3>
              <p>The gatekeeper between your staging environment and your users.</p>
            </div>
            <div className="why-item">
              <span className="why-icon">👁️</span>
              <h3>Objective</h3>
              <p>AI agents don't have bias. They see the UX exactly as it is.</p>
            </div>
            <div className="why-item">
              <span className="why-icon">🚀</span>
              <h3>Built for Scale</h3>
              <p>Audit 1,000 pages in minutes, not weeks of manual QA.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyDifferent
