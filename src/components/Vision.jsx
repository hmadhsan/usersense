import './Vision.css'

function Vision() {
  return (
    <section id="vision" className="vision-section section">
      <div className="container">
        <div className="vision-card fade-in">
          <span className="section-label">Our Manifesto</span>
          <h2 className="vision-title">
            The best AI coding tool of 2027 <br />
            <span className="gradient-text">won’t write any code.</span>
          </h2>

          <div className="vision-content">
            <p className="vision-lead">
              We're currently in the "generation" phase. AI writes functions, builds features, and refactors codebases. But generation is becoming commoditized.
            </p>

            <div className="vision-grid">
              <div className="vision-point">
                <h3>The Missing Link</h3>
                <p>AI can write a checkout flow in minutes, but can it tell you if the button feels clickable? If the loading state causes confusion? Or if users will abandon at step 3?</p>
              </div>
              <div className="vision-point">
                <h3>The Experience Phase</h3>
                <p>The next frontier isn't AI that writes code—it's AI that <strong>uses software</strong>. AI that doesn't just test functions, but experiences products like a human would.</p>
              </div>
            </div>

            <blockquote className="vision-quote">
              "UserSense catches what humans miss before humans get frustrated. Ship with confidence, not hope."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Vision
