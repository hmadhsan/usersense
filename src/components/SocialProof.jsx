import './SocialProof.css'

function SocialProof() {
  const logos = [
    { name: 'Stripe', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg' },
    { name: 'Airbnb', url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Belo.svg' },
    { name: 'Linear', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Linear_logo.svg' },
    { name: 'Scale AI', url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Scale_AI_Logo.svg' },
    { name: 'Vercel', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg' },
  ]

  return (
    <section className="social-proof section">
      <div className="marquee-container">
        <div className="marquee-content">
          {[...logos, ...logos].map((logo, index) => (
            <div key={index} className="logo-item">
              <img src={logo.url} alt={logo.name} className="brand-logo" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


export default SocialProof
