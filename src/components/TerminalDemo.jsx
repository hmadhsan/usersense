import { useState, useEffect, useRef } from 'react'
import './TerminalDemo.css'

const scenarios = [
  {
    name: 'Signup Form Analysis',
    command: 'usersense check app.example.com/signup',
    output: [
      { type: 'info', text: '' },
      { type: 'info', text: '  UserSense v0.1.0' },
      { type: 'info', text: '  ─────────────────────────────────────' },
      { type: 'info', text: '' },
      { type: 'step', text: '  [1/4] Opening browser...' },
      { type: 'step', text: '  [2/4] Navigating to page...' },
      { type: 'step', text: '  [3/4] Analyzing elements...' },
      { type: 'step', text: '  [4/4] Generating report...' },
      { type: 'info', text: '' },
      { type: 'header', text: '  ══════════════════════════════════════' },
      { type: 'header', text: '   FRICTION REPORT' },
      { type: 'header', text: '  ══════════════════════════════════════' },
      { type: 'info', text: '' },
      { type: 'info', text: '  URL: app.example.com/signup' },
      { type: 'info', text: '  Load time: 1.2s ✓' },
      { type: 'info', text: '' },
      { type: 'error', text: '  ✗ Issue #1: Form too long' },
      { type: 'detail', text: '    Found 9 fields (max recommended: 5)' },
      { type: 'fix', text: '    → Split into multiple steps' },
      { type: 'info', text: '' },
      { type: 'error', text: '  ✗ Issue #2: Competing CTAs' },
      { type: 'detail', text: '    Found 4 buttons competing for attention' },
      { type: 'fix', text: '    → Use single primary action' },
      { type: 'info', text: '' },
      { type: 'error', text: '  ✗ Issue #3: Small tap target' },
      { type: 'detail', text: '    Submit button: 38px (min: 44px)' },
      { type: 'fix', text: '    → Increase button size' },
      { type: 'info', text: '' },
      { type: 'header', text: '  ──────────────────────────────────────' },
      { type: 'warning', text: '   ⚠ 3 friction points detected' },
      { type: 'header', text: '  ──────────────────────────────────────' },
      { type: 'info', text: '' },
    ]
  },
  {
    name: 'Checkout Flow Analysis',
    command: 'usersense check shop.demo.com/checkout',
    output: [
      { type: 'info', text: '' },
      { type: 'info', text: '  UserSense v0.1.0' },
      { type: 'info', text: '  ─────────────────────────────────────' },
      { type: 'info', text: '' },
      { type: 'step', text: '  [1/4] Opening browser...' },
      { type: 'step', text: '  [2/4] Navigating to page...' },
      { type: 'step', text: '  [3/4] Analyzing elements...' },
      { type: 'step', text: '  [4/4] Generating report...' },
      { type: 'info', text: '' },
      { type: 'header', text: '  ══════════════════════════════════════' },
      { type: 'header', text: '   FRICTION REPORT' },
      { type: 'header', text: '  ══════════════════════════════════════' },
      { type: 'info', text: '' },
      { type: 'info', text: '  URL: shop.demo.com/checkout' },
      { type: 'error', text: '  Load time: 3.4s ✗ (slow)' },
      { type: 'info', text: '' },
      { type: 'error', text: '  ✗ Issue #1: Slow page load' },
      { type: 'detail', text: '    3.4s exceeds 2s threshold' },
      { type: 'fix', text: '    → Optimize images, enable caching' },
      { type: 'info', text: '' },
      { type: 'success', text: '  ✓ Clear primary CTA found' },
      { type: 'success', text: '  ✓ Form has 4 fields (good)' },
      { type: 'info', text: '' },
      { type: 'error', text: '  ✗ Issue #2: Missing loading state' },
      { type: 'detail', text: '    No feedback after "Pay" click' },
      { type: 'fix', text: '    → Add loading spinner' },
      { type: 'info', text: '' },
      { type: 'header', text: '  ──────────────────────────────────────' },
      { type: 'warning', text: '   ⚠ 2 friction points detected' },
      { type: 'header', text: '  ──────────────────────────────────────' },
      { type: 'info', text: '' },
    ]
  },
  {
    name: 'Optimized Flow',
    command: 'usersense check stripe.com/checkout',
    output: [
      { type: 'info', text: '' },
      { type: 'info', text: '  UserSense v0.1.0' },
      { type: 'info', text: '  ─────────────────────────────────────' },
      { type: 'info', text: '' },
      { type: 'step', text: '  [1/4] Opening browser...' },
      { type: 'step', text: '  [2/4] Navigating to page...' },
      { type: 'step', text: '  [3/4] Analyzing elements...' },
      { type: 'step', text: '  [4/4] Generating report...' },
      { type: 'info', text: '' },
      { type: 'header', text: '  ══════════════════════════════════════' },
      { type: 'header', text: '   FRICTION REPORT' },
      { type: 'header', text: '  ══════════════════════════════════════' },
      { type: 'info', text: '' },
      { type: 'info', text: '  URL: stripe.com/checkout' },
      { type: 'success', text: '  Load time: 0.8s ✓ (fast)' },
      { type: 'info', text: '' },
      { type: 'success', text: '  ✓ Single clear CTA' },
      { type: 'success', text: '  ✓ Minimal form (4 fields)' },
      { type: 'success', text: '  ✓ Loading states present' },
      { type: 'success', text: '  ✓ Good button size (48px)' },
      { type: 'success', text: '  ✓ Clear error handling' },
      { type: 'info', text: '' },
      { type: 'header', text: '  ──────────────────────────────────────' },
      { type: 'result', text: '   ✓ 0 friction points — great UX!' },
      { type: 'header', text: '  ──────────────────────────────────────' },
      { type: 'info', text: '' },
    ]
  }
];

function TerminalDemo() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState('typing'); // 'typing' | 'running' | 'done'
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const bodyRef = useRef(null);

  const scenario = scenarios[currentScenario];
  const fullCommand = `$ ${scenario.command}`;

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setElapsed(prev => prev + 100);
    }, 100);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Typing animation
  useEffect(() => {
    if (!isPlaying || phase !== 'typing') return;

    if (typedCommand.length < fullCommand.length) {
      const timer = setTimeout(() => {
        setTypedCommand(fullCommand.slice(0, typedCommand.length + 1));
      }, 50 + Math.random() * 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setPhase('running');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [typedCommand, phase, isPlaying, fullCommand]);

  // Output animation
  useEffect(() => {
    if (!isPlaying || phase !== 'running') return;

    if (visibleLines < scenario.output.length) {
      const line = scenario.output[visibleLines];
      const delay = line?.type === 'info' && line.text === '' ? 50 :
        line?.type === 'step' ? 300 :
          line?.type === 'header' ? 150 :
            line?.type === 'error' ? 200 :
              100;

      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setPhase('done');
      const timer = setTimeout(() => {
        nextScenario();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, phase, isPlaying, scenario.output.length]);

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLines, typedCommand]);

  const nextScenario = () => {
    setCurrentScenario((prev) => (prev + 1) % scenarios.length);
    setTypedCommand('');
    setVisibleLines(0);
    setPhase('typing');
    setElapsed(0);
  };

  const selectScenario = (index) => {
    setCurrentScenario(index);
    setTypedCommand('');
    setVisibleLines(0);
    setPhase('typing');
    setElapsed(0);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const restart = () => {
    setTypedCommand('');
    setVisibleLines(0);
    setPhase('typing');
    setElapsed(0);
    setIsPlaying(true);
  };

  const formatTime = (ms) => {
    const secs = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${secs}.${tenths}s`;
  };

  return (
    <section id="demo" className="terminal-demo section">
      <div className="container">
        <div className="demo-header">
          <span className="section-label">Live Demo</span>
          <h2 className="demo-title">Watch UserSense analyze a page</h2>
          <p className="demo-subtitle">
            Real friction detection in action — no setup, just paste a URL.
          </p>
        </div>

        <div className="scenario-tabs">
          {scenarios.map((s, index) => (
            <button
              key={index}
              className={`scenario-tab ${currentScenario === index ? 'active' : ''}`}
              onClick={() => selectScenario(index)}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="terminal-wrapper">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="terminal-title">Terminal — usersense</span>
              <div className="recording-indicator">
                <span className="rec-dot"></span>
                <span className="rec-text">REC</span>
                <span className="rec-time">{formatTime(elapsed)}</span>
              </div>
            </div>
            <div className="terminal-body" ref={bodyRef}>
              <div className="terminal-line command">
                {typedCommand}
                {phase === 'typing' && isPlaying && <span className="cursor">▋</span>}
              </div>
              {phase !== 'typing' && scenario.output.slice(0, visibleLines).map((line, index) => (
                <div key={index} className={`terminal-line ${line.type}`}>
                  {line.text}
                </div>
              ))}
              {phase === 'running' && isPlaying && (
                <span className="cursor">▋</span>
              )}
            </div>
          </div>

          <div className="terminal-controls">
            <button className="control-btn" onClick={togglePlay}>
              {isPlaying ? (
                <><PauseIcon /> Pause</>
              ) : (
                <><PlayIcon /> Play</>
              )}
            </button>
            <button className="control-btn" onClick={restart}>
              <RestartIcon /> Restart
            </button>
          </div>
        </div>

        <div className="demo-features">
          <div className="demo-feature">
            <span className="feature-emoji">⚡</span>
            <div className="feature-content">
              <strong>Instant analysis</strong>
              <span>Results in seconds</span>
            </div>
          </div>
          <div className="demo-feature">
            <span className="feature-emoji">🎯</span>
            <div className="feature-content">
              <strong>Actionable fixes</strong>
              <span>Not just problems</span>
            </div>
          </div>
          <div className="demo-feature">
            <span className="feature-emoji">🔌</span>
            <div className="feature-content">
              <strong>CI/CD ready</strong>
              <span>JSON output</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Icons
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const RestartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export default TerminalDemo
