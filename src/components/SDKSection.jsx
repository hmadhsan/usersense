import './SDKSection.css'

function SDKSection() {
  const codeExample = `import { UserSense } from '@usersense/sdk';

const session = new UserSense.Session({
  project: 'my-product',
  environment: 'staging',
});

const report = await session.simulateGoal('CheckoutFlow');

console.log(report);
// {
//   step: 2,
//   status: 'friction_detected',
//   issue: 'Add to Cart button is not prominent',
//   suggestion: 'Highlight primary action'
// }`

  return (
    <section id="sdk" className="sdk-section section">
      <div className="container">
        <div className="sdk-layout">
          <div className="sdk-content">
            <span className="section-label">For Developers</span>
            <h2 className="sdk-title">Simulate UserSense agents programmatically</h2>
            <p className="sdk-description">
              Run friction checks in CI/CD, staging, or anywhere you need structured UX feedback.
            </p>
            <a href="#cta" className="btn btn-secondary">
              View Documentation
            </a>
          </div>
          <div className="sdk-code-block">
            <div className="code-header">
              <div className="code-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="code-filename">simulation.js</span>
            </div>
            <pre className="code-content">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SDKSection
