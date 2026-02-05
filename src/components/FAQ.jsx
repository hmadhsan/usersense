import './FAQ.css'

function FAQ() {
  const faqs = [
    {
      q: "How is UserSense different from Playwright or Cypress?",
      a: "Playwright checks if your code works. UserSense checks if your product works for humans. We use AI to simulate user intent, detect frustration (rage clicks), and measure cognitive load (competing CTAs) that traditional tests miss."
    },
    {
      q: "Can I run this in my CI/CD pipeline?",
      a: "Yes. UserSense is built for developers. You can use our GitHub Action to automatically audit every Pull Request. If the 'Friction Score' drops below your threshold, we can even fail the build."
    },
    {
      q: "Does it work with any tech stack?",
      a: "Absolutely. Since UserSense operates at the browser level like a real user, it doesn't matter if you're using React, Vue, HTMX, or plain HTML. If it runs in a browser, UserSense can experience it."
    },
    {
      q: "Do I need to write complex simulation scripts?",
      a: "No. You define goals (e.g., 'Finish Signup'), and our engine handles the rest. You provide the 'what', UserSense figures out the 'how' and reports the friction."
    }
  ]

  return (
    <section id="faq" className="faq-section section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Support</span>
          <h2 className="section-title">Common Questions</h2>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div className="faq-item card" key={index}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
