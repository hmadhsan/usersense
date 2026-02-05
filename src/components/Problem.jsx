import './Problem.css'

function Problem() {
  return (
    <section className="problem section">
      <div className="container">
        <div className="problem-content">
          <span className="section-label">The Experience Gap</span>
          <h2 className="problem-title">
            Your tests pass.<br />
            <span className="text-muted">Your users struggle.</span>
          </h2>
          <div className="problem-points">
            <div className="problem-point">
              <span className="point-indicator"></span>
              <span>Confusing CTAs that cause choice paralysis</span>
            </div>
            <div className="problem-point">
              <span className="point-indicator"></span>
              <span>Silent friction that forces users to quit</span>
            </div>
            <div className="problem-point">
              <span className="point-indicator"></span>
              <span>UX rot that analytics only shows after it's too late</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Problem
