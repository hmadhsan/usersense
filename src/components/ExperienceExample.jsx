import './ExperienceExample.css'

function ExperienceExample() {
  const logs = [
    { time: '00:00', action: 'session.start', detail: 'Entering product as new user' },
    { time: '00:03', action: 'navigate', detail: '/signup' },
    { time: '00:08', action: 'input.fill', detail: 'email, password fields' },
    { time: '00:12', action: 'button.click', detail: '"Create Account"', status: 'ok' },
    { time: '00:14', action: 'wait', detail: 'Expected confirmation...', status: 'hesitate' },
    { time: '00:18', action: 'observation', detail: 'No loading indicator visible', status: 'flag' },
    { time: '00:21', action: 'button.click', detail: '"Create Account" (retry)', status: 'warn' },
    { time: '00:24', action: 'error.toast', detail: '"Account already exists"', status: 'flag' },
  ]

  return (
    <section id="example" className="experience-example section">
      <div className="container">
        <div className="example-header">
          <span className="section-label">Live Example</span>
          <h2 className="example-title">What UserSense sees</h2>
        </div>
        <div className="example-content">
          <div className="example-scenario">
            <div className="scenario-header">
              <span className="scenario-goal">Goal: Create an account</span>
              <span className="scenario-result scenario-result-issues">2 issues detected</span>
            </div>
          </div>
          <div className="example-log glass">
            <div className="log-header">
              <span className="log-title">usersense.log</span>
              <div className="log-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div className="log-content">
              {logs.map((log, index) => (
                <div key={index} className={`log-line ${log.status || ''}`}>
                  <span className="log-time">{log.time}</span>
                  <span className="log-action">{log.action}</span>
                  <span className="log-detail">{log.detail}</span>
                  {log.status === 'flag' && <span className="log-flag">⚑</span>}
                  {log.status === 'hesitate' && <span className="log-hesitate">◦◦◦</span>}
                  {log.status === 'warn' && <span className="log-warn">↻</span>}
                </div>
              ))}
            </div>
            <div className="log-summary">
              <div className="summary-item">
                <span className="summary-icon flag">⚑</span>
                <span>Missing loading state after submit</span>
              </div>
              <div className="summary-item">
                <span className="summary-icon flag">⚑</span>
                <span>Double-submit caused error</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceExample
