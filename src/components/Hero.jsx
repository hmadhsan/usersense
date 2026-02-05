import { useState } from 'react'
import './Hero.css'

function Hero() {
  const [isScanning, setIsScanning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [activePersona, setActivePersona] = useState('The Perfectionist')
  const [url, setUrl] = useState('')
  const [goal, setGoal] = useState('Explore the product and find friction')
  const [scanStatus, setScanStatus] = useState('')
  const [resultData, setResultData] = useState(null)

  const scanSteps = [
    'Initializing simulation engine...',
    'Navigating as first-time user...',
    'Analyzing visual hierarchy...',
    'Measuring Performance (LCP/FCP)...',
    'Auditing Contrast & Accessibility...',
    'Checking for rage-click patterns...',
    'Finalizing friction report...'
  ]

  const frictionPool = [
    { id: 'lcp', icon: '⚡', title: 'Slow LCP', desc: 'Largest Contentful Paint took over 2.5s.', impact: 'Performance' },
    { id: 'contrast', icon: '⚠️', title: 'Low Contrast', desc: 'Text contrast is below 4.5:1 threshold.', impact: 'Accessibility' },
    { id: 'cta', icon: '🎯', title: 'Competing CTAs', desc: 'Multiple primary actions causing confusion.', impact: 'UX Design' },
    { id: 'rage', icon: '🖱️', title: 'Rage Clicks', desc: 'Repetitive clicking detected on static elements.', impact: 'Frustration' },
    { id: 'alt', icon: '🖼️', title: 'Missing Alt Text', desc: 'Images lack descriptive labels for screen readers.', impact: 'Accessibility' },
    { id: 'size', icon: '📱', title: 'Small Targets', desc: 'Interactive elements are below 44px min.', impact: 'Mobile UX' }
  ]

  const generateResult = (inputUrl) => {
    // Simple hash function for consistent results per URL
    let hash = 0
    for (let i = 0; i < inputUrl.length; i++) {
      hash = ((hash << 5) - hash) + inputUrl.charCodeAt(i)
      hash |= 0
    }
    const absHash = Math.abs(hash)

    const score = 40 + (absHash % 50) // Score between 40-90
    const issueCount = 2 + (absHash % 2) // 2 or 3 issues

    // Pick unique issues from the pool
    const selectedIssues = []
    const availablePool = [...frictionPool]
    for (let i = 0; i < issueCount; i++) {
      const index = (absHash + i) % availablePool.length
      selectedIssues.push(availablePool[index])
      availablePool.splice(index, 1)
    }

    return {
      score,
      issues: selectedIssues,
      status: score > 80 ? 'Good' : score > 60 ? 'Warning' : 'Critical'
    }
  }

  const handleScan = async () => {
    if (!url) return
    setIsScanning(true)
    setShowResult(false)
    setResultData(null)

    // Start with the first status
    setScanStatus(scanSteps[0])

    // UI progress simulation while waiting for real API
    let step = 0
    const progressInterval = setInterval(() => {
      if (step < scanSteps.length - 2) {
        step++
        setScanStatus(scanSteps[step])
      }
    }, 1500)

    try {
      const response = await fetch('http://localhost:3001/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, goal, persona: activePersona })
      })

      if (!response.ok) throw new Error('API request failed')

      const data = await response.json()

      clearInterval(progressInterval)
      setScanStatus('Analyzing AI Insights...')

      // Map real data to UI
      const frictionScore = 100 - (data.frictionPoints * 8)
      const mappedIssues = data.report
        .filter(r => r.status === 'friction_detected')
        .map(issue => ({
          id: Math.random().toString(36).substr(2, 9),
          icon: issue.issue.includes('AI') ? '🧠' : '⚠️',
          title: issue.issue,
          desc: issue.impact,
          suggestion: issue.suggestion
        }))

      setResultData({
        score: Math.max(0, Math.min(100, frictionScore)),
        issues: mappedIssues,
        status: frictionScore > 85 ? 'Healthy' : frictionScore > 60 ? 'Warning' : 'Critical'
      })

      setTimeout(() => {
        setIsScanning(false)
        setShowResult(true)
      }, 500)

    } catch (error) {
      console.error('Scan Error:', error)
      clearInterval(progressInterval)
      setIsScanning(false)

      const isAPIError = error.message.includes('API request failed');
      const errorMsg = isAPIError
        ? "Audit failed: The simulation timed out or encountered an error. Try or different URL or goal."
        : "UserSense Bridge is offline. Make sure 'node api/server.js' is running!";

      alert(errorMsg);
    }
  }

  return (
    <section className="hero">
      <div className="hero-glow"></div>

      {/* Floating AI Particles */}
      <div className="floating-nodes">
        <div className="node node-1">🧠</div>
        <div className="node node-2">⚡</div>
        <div className="node node-3">🎯</div>
        <div className="node node-4">🖱️</div>
        <div className="node node-5">🪄</div>
        <div className="node node-6">👁️</div>
      </div>

      <div className="container">
        <div className="hero-content">
          <p className="hero-badge reveal-text">
            Deep UX Analysis — Before Your Users Ship a Single Byte
          </p>
          <h1 className="hero-title reveal-text">
            Stop Guessing. <br />
            <span className="gradient-text">See Your Product Through AI Eyes.</span>
          </h1>


          <p className="hero-subtitle fade-in-delay-1">
            UserSense deploys autonomous agents to find every point of friction
            before a human ever touches your site. Executive-grade UX intelligence in seconds.
          </p>
          <div className="hero-ctas fade-in fade-in-delay-3">
            <div className="persona-mini-selector">
              <span className="selector-label">Simulate Behavior:</span>
              <div className="persona-choices">
                {[
                  { id: 'The Perfectionist', icon: '💎', label: 'Perfectionist' },
                  { id: 'The First-Timer', icon: '❓', label: 'First-Timer' },
                  { id: 'The Power User', icon: '⚡', label: 'Power User' }
                ].map(p => (
                  <button
                    key={p.id}
                    className={`persona-choice-btn ${activePersona === p.id ? 'active' : ''}`}
                    onClick={() => setActivePersona(p.id)}
                    title={p.id}
                    disabled={isScanning}
                  >
                    <span className="p-icon">{p.icon}</span>
                    <span className="p-label">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={`live-check-input-wrapper ${isScanning ? 'scanning' : ''} ${showResult ? 'success' : ''}`}>
              <div className="input-split">
                <input
                  type="text"
                  placeholder="App URL (e.g., stripe.com)"
                  className="live-check-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isScanning}
                />
                <input
                  type="text"
                  placeholder="Simulation Goal (e.g., Complete signup)"
                  className="live-check-goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  disabled={isScanning}
                />
              </div>
              <button
                className={`btn btn-gradient ${isScanning ? 'loading' : ''}`}
                onClick={handleScan}
                disabled={isScanning}
              >
                {isScanning ? 'Tracing Journey...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {isScanning && (
            <div className="hero-scanning-status fade-in">
              <div className="scanning-loader"></div>
              <p>{scanStatus}</p>
            </div>
          )}

          {showResult && resultData && (
            <div className="hero-result-preview fade-in">
              <div className="result-header">
                <span className="result-score">Friction Score: {resultData.score}/100</span>
                <span className="result-badge critical">{resultData.status} UX Status</span>
              </div>
              <div className="result-grid">
                {resultData.issues.map(issue => (
                  <div className="result-item" key={issue.id}>
                    <span className="result-icon">{issue.icon}</span>
                    <div>
                      <strong>{issue.title}</strong>
                      <p>{issue.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="result-actions">
                <button className="btn btn-secondary btn-small" onClick={() => setShowResult(false)}>
                  Clear Result
                </button>
                <a href="#cta" className="btn btn-gradient btn-mini">Get Full Audit</a>
              </div>
            </div>
          )}

          <div className="hero-product-preview fade-in-delay-3">
            <div className="preview-container">
              <img
                src="/usersense_executive_dashboard_reveal.png"
                alt="UserSense Executive Dashboard Reveal"
                className="hero-dashboard-img"
              />
              <div className="preview-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
