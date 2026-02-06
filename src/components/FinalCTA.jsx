import { useState } from 'react'
import './FinalCTA.css'

function FinalCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '')
      const res = await fetch(`${API_BASE_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <section id="cta" className="final-cta section">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">
            Stop shipping with hope.<br />
            <span className="gradient-text">Start shipping with confidence.</span>
          </h2>
          <p className="cta-description">
            Experience your product before your users do. Join the exclusive private beta today.
          </p>

          {status === 'success' ? (
            <div className="success-message" style={{ padding: '2rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '12px', border: '1px solid #00ff88', marginTop: '2rem' }}>
              <h3 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>You're on the list! 🚀</h3>
              <p style={{ color: '#ccc' }}>We'll verify your access shortly. Keep an eye on your inbox.</p>
            </div>
          ) : (
            <form className="cta-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cta-input"
                disabled={status === 'loading'}
                required
              />
              <button type="submit" className="btn btn-gradient" disabled={status === 'loading'}>
                {status === 'loading' ? 'Joining...' : 'Request Access'}
              </button>
            </form>
          )}

          {status === 'error' && <p style={{ color: '#ff4444', marginTop: '1rem' }}>Something went wrong. Please try again.</p>}

          <p className="cta-note">
            Early teams shape the product.
          </p>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
