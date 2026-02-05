import './HowItWorks.css'

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Deploy the Agent',
      description: 'Connect UserSense to your staging environment or a live URL in seconds.',
    },
    {
      number: '02',
      title: 'Experience Cycle',
      description: 'Your AI agent navigates the flow, seeking out friction points and dead ends.',
    },
    {
      number: '03',
      title: 'Friction Captured',
      description: 'Receive a visual audit detailing every moment a user would have struggled.',
    },
  ]

  return (
    <section id="how" className="how-it-works section">
      <div className="container">
        <div className="how-header">
          <span className="section-label">The Process</span>
          <h2 className="how-title">The Simulation Cycle</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <span className="step-number">{step.number}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
