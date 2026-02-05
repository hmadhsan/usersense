import { useState } from 'react'
import './FinalCTA.css'

function FinalCTA() {
  const [email, setEmail] = useState('')

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
          <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cta-input"
            />
            <button type="submit" className="btn btn-gradient">
              Request Access
            </button>
          </form>
          <p className="cta-note">
            Early teams shape the product.
          </p>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
