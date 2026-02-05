import './ExperienceReport.css'

function ExperienceReport() {
  return (
    <section id="report" className="experience-report section">
      <div className="container">
        <div className="report-header">
          <span className="section-label">Output</span>
          <h2 className="report-title">Experience Report</h2>
        </div>
        <div className="report-card">
          <div className="report-goal">
            <span className="goal-label">GOAL</span>
            <span className="goal-value">Create an account</span>
          </div>

          <div className="report-steps">
            <div className="report-step success">
              <span className="step-icon">✓</span>
              <span className="step-text">Landing page understood</span>
            </div>
            <div className="report-step warning">
              <span className="step-icon">⚠</span>
              <span className="step-text">Competing signup CTAs detected</span>
            </div>
            <div className="report-step notice">
              <span className="step-icon">⏳</span>
              <span className="step-text">User hesitation observed (3.2s)</span>
            </div>
          </div>

          <div className="report-divider"></div>

          <div className="report-section">
            <div className="section-header">STEP 3: Email verification</div>
            <div className="report-step error">
              <span className="step-icon">✗</span>
              <span className="step-text">No loading feedback</span>
            </div>
            <div className="report-step error">
              <span className="step-icon">✗</span>
              <span className="step-text">Primary action unclear</span>
            </div>
          </div>

          <div className="report-divider"></div>

          <div className="report-outcome">
            <div className="outcome-row">
              <span className="outcome-label">LIKELY OUTCOME</span>
              <span className="outcome-value">User abandons the flow at this step</span>
            </div>
            <div className="outcome-row">
              <span className="outcome-label">REASON</span>
              <span className="outcome-value">Unclear system state and decision overload</span>
            </div>
          </div>

          <div className="report-divider"></div>

          <div className="report-fixes">
            <div className="fixes-label">SUGGESTED FIXES</div>
            <ul className="fixes-list">
              <li>Add explicit loading state</li>
              <li>Reduce choices to a single primary action</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceReport
