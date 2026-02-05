import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import WorkflowDiagram from './components/WorkflowDiagram'
import Problem from './components/Problem'
import Features from './components/Features'
import WhyDifferent from './components/WhyDifferent'
import HowItWorks from './components/HowItWorks'
import Vision from './components/Vision'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="app">
      <div
        className="mouse-glow"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
        }}
      />
      <Header />
      <main>
        <Hero />
        <WorkflowDiagram />
        <Problem />
        <WhyDifferent />
        <Features />
        <HowItWorks />
        <Vision />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default App

