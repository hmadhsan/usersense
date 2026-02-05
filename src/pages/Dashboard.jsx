import { useState, useEffect } from 'react';
import { LayoutGrid, PlayCircle, BarChart3, Settings, Shield, User, Bell, Search, Globe, ChevronRight, Activity, AlertCircle, TrendingUp, Zap, MousePointer2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('simulations');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanUrl, setScanUrl] = useState('');
  const [scanGoal, setScanGoal] = useState('Complete a standard signup flow');
  const [scanStep, setScanStep] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState('The Perfectionist');

  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:3001/reports');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRunSimulation = async () => {
    if (!scanUrl) return;
    setScanning(true);
    setScanStep(1);
    setScanLogs(['Initializing UserSense Agent...', 'Connecting to target environment...']);

    try {
      // Step simulation for UI feedback
      setTimeout(() => setScanLogs(prev => [...prev, 'Agent navigating to target URL...']), 2000);
      setTimeout(() => { setScanStep(2); setScanLogs(prev => [...prev, `Auditing page for friction points matching goal: "${scanGoal}"`]); }, 4000);
      setTimeout(() => { setScanStep(3); setScanLogs(prev => [...prev, 'AI analyzing visual hierarchy and cognitive load...']); }, 7000);

      const response = await fetch('http://localhost:3001/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl, goal: scanGoal, persona: selectedPersona })
      });

      if (response.ok) {
        setScanLogs(prev => [...prev, 'Simulation complete. Persisting findings...']);
        setTimeout(() => {
          setScanning(false);
          setShowModal(false);
          fetchReports();
        }, 1500);
      }
    } catch (err) {
      setScanLogs(prev => [...prev, 'Error: Simulation failed to complete.']);
      setScanning(false);
    }
  };

  const totalFriction = reports.reduce((acc, r) => acc + r.friction, 0);
  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + r.score, 0) / reports.length)
    : 100;

  // Transform reports for chart
  const chartData = [...reports].reverse().map(r => ({
    name: r.date.split('-').slice(1).join('/'),
    score: r.score,
    friction: r.friction
  }));

  const renderSimulationsList = () => (
    <div className="dashboard-section card">
      <div className="section-header">
        <h3>Recent Audits</h3>
        <button className="text-btn">View All</button>
      </div>

      <div className="simulation-list">
        {loading ? (
          <div className="loading-state">Loading actual intelligence...</div>
        ) : (
          reports.map(report => (
            <div className="simulation-row" key={report.id} onClick={() => setSelectedReport(report)}>
              <div className="row-info">
                <div className="row-icon">
                  <Globe size={16} />
                </div>
                <div className="row-details">
                  <span className="row-url">{report.url}</span>
                  <span className="row-meta">
                    {report.goal} • {report.steps} Steps
                  </span>
                </div>
              </div>

              <div className="row-stats">
                <div className="stat-group">
                  <span className="stat-label">Score</span>
                  <span className={`stat-value ${report.score < 60 ? 'bad' : 'good'}`}>{report.score}</span>
                </div>
                <div className="stat-group">
                  <span className="stat-label">Friction</span>
                  <span className="stat-value">{report.friction}</span>
                </div>
              </div>

              <div className={`status-badge ${report.status.toLowerCase()}`}>
                {report.status}
              </div>
              <ChevronRight size={16} className="row-arrow" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalyticsView = () => {
    // Generate analytics data from reports
    const frictionTypes = [
      { name: 'Visual', value: reports.reduce((acc, r) => acc + (r.friction > 0 ? Math.ceil(r.friction * 0.45) : 0), 0), color: '#6366F1' },
      { name: 'Performance', value: reports.reduce((acc, r) => acc + (r.friction > 0 ? Math.ceil(r.friction * 0.3) : 0), 0), color: '#F43F5E' },
      { name: 'A11y', value: reports.reduce((acc, r) => acc + (r.friction > 0 ? Math.floor(r.friction * 0.25) : 0), 0), color: '#10B981' }
    ];

    const performanceData = [...reports].reverse().slice(-7).map(r => ({
      name: r.date.split('-').slice(1).join('/'),
      success: Math.round(100 - (r.friction * 3)),
      steps: r.steps
    }));

    // Extract real friction coordinates for the heatmap
    const allHotspots = reports.flatMap(report =>
      (report.journey || [])
        .filter(step => step.status === 'friction_detected' && step.coordinates)
        .map(step => ({
          x: (step.coordinates.x / 1280) * 100, // Normalize to %
          y: (step.coordinates.y / 800) * 100,
          issue: step.issue,
          impact: step.impact,
          persona: report.persona || 'Default'
        }))
    );

    return (
      <div className="analytics-view fade-in">
        <div className="analytics-grid-top">
          <div className="dashboard-section card">
            <div className="section-header">
              <h3>Friction Distribution</h3>
              <span className="text-muted text-xs">By Category</span>
            </div>
            <div className="chart-container" style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={frictionTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {frictionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-section card">
            <div className="section-header">
              <h3>Journey Success Rate</h3>
              <span className="text-muted text-xs">Last 7 Simulations</span>
            </div>
            <div className="chart-container" style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="rgba(0,0,0,0.4)" />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="rgba(0,0,0,0.4)" />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="success" fill="#6366F1" radius={[4, 4, 0, 0]} name="Journey Health %" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="analytics-insights-grid">
          <div className="insight-card-mini card glass-accent">
            <Activity size={20} className="text-accent" />
            <div className="val">84ms</div>
            <div className="label">Avg. Interaction Delay</div>
          </div>
          <div className="insight-card-mini card glass-accent">
            <AlertCircle size={20} className="text-red" />
            <div className="val">12%</div>
            <div className="label">Critical Drop-off Risk</div>
          </div>
          <div className="insight-card-mini card glass-accent">
            <Zap size={20} className="text-yellow" />
            <div className="val">92%</div>
            <div className="label">Agent Accuracy</div>
          </div>
        </div>

        <div className="dashboard-section card cognitive-intensity-map">
          <div className="section-header">
            <h3>Friction Intensity Map</h3>
            <div className="header-labels">
              <span className="label-item"><span className="dot low"></span> Low</span>
              <span className="label-item"><span className="dot high"></span> High Friction</span>
            </div>
          </div>
          <div className="intensity-container">
            <div className="intensity-overlay">
              {allHotspots.length === 0 ? (
                <div className="no-data-hint">No specialized friction coordinates detected yet...</div>
              ) : (
                allHotspots.map((hs, i) => (
                  <div
                    key={i}
                    className="friction-hotspot"
                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  >
                    <div className="hotspot-pulse"></div>
                    <div className="hotspot-tooltip">
                      <div className="hs-persona">{hs.persona}</div>
                      <div className="hs-issue">{hs.issue}</div>
                      <div className="hs-impact">{hs.impact}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Abstract Page Skeleton */}
            <div className="page-skeleton">
              <div className="skel-header"></div>
              <div className="skel-content">
                <div className="skel-sidebar"></div>
                <div className="skel-main">
                  <div className="skel-hero"></div>
                  <div className="skel-grid">
                    <div className="skel-card"></div>
                    <div className="skel-card"></div>
                    <div className="skel-card"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="intensity-footer">
            <p className="text-muted text-sm">
              Real-time visualization of interaction complexity clusters. Red zones indicate where AI agents encountered high decision branches.
            </p>
            <button className="btn btn-secondary btn-mini">Detailed Audit</button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardOverview = () => (
    <>
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Audits</div>
          <div className="stat-value">{reports.length}</div>
          <div className="stat-trend positive">+12% vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Friction Score</div>
          <div className="stat-value">{avgScore}<span className="unit">/100</span></div>
          <div className={`stat-trend ${avgScore < 70 ? 'negative' : 'positive'}`}>
            {avgScore < 70 ? 'Quality improvement needed' : 'Top-tier experience'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">System Health</div>
          <div className="stat-value">Elite<span className="unit">AI</span></div>
          <div className="stat-trend status">Agents Ready</div>
        </div>
      </div>

      {/* Data Visualizations */}
      <div className="dashboard-grid-2">
        <div className="dashboard-section card">
          <div className="section-header">
            <div className="section-title-group">
              <TrendingUp size={18} className="text-accent" />
              <h3>Experience Trend</h3>
            </div>
          </div>
          <div className="chart-container" style={{ height: '240px', marginTop: '20px' }}>
            {loading ? (
              <div className="loading-placeholder">Calculating trends...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#09090B' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Experience Score" />
                  <Area type="monotone" dataKey="friction" stroke="#EF4444" strokeWidth={2} fillOpacity={0} name="Friction Points" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="dashboard-section card glass-accent">
          <div className="section-header">
            <div className="section-title-group">
              <Zap size={18} className="text-yellow" />
              <h3>AI Intelligence</h3>
            </div>
          </div>
          <div className="ai-insight-content">
            <div className="ai-stat">
              <span className="ai-label">Critical Barrier</span>
              <span className="ai-val">Cognitive Load</span>
            </div>
            <p className="ai-description">
              Based on your latest autonomous simulations, users are experiencing high cognitive strain on navigation headers.
            </p>
            <button className="btn btn-secondary btn-mini" style={{ marginTop: '16px' }}>Deep Analysis</button>
          </div>
        </div>
      </div>

      {renderSimulationsList()}
    </>
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Shield size={20} className="logo-icon" />
          </div>
          <span className="brand-name">UserSense</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'simulations' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulations')}
          >
            <PlayCircle size={18} />
            <span>Simulations</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Insights</span>
          </button>
          <div className="nav-divider"></div>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-plan">Pro Plan</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="main-header">
          <div className="header-search">
            <Search size={16} />
            <input type="text" placeholder="Search simulations..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Bell size={18} /></button>
            <button className="icon-btn"><User size={18} /></button>
            <button className="btn btn-gradient btn-small" onClick={() => setShowModal(true)}>New Simulation</button>
          </div>
        </header>

        <div className="main-content-scroll">
          <div className="content-container">
            <header className="content-header">
              <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p>
                {activeTab === 'dashboard' ? 'Overview of your product experience health.' :
                  activeTab === 'simulations' ? 'Real-world UX audits performed by your AI agents.' :
                    'Advanced behavioral analytics and AI insights.'}
              </p>
            </header>

            {activeTab === 'dashboard' ? renderDashboardOverview() :
              activeTab === 'simulations' ? renderSimulationsList() :
                renderAnalyticsView()}
          </div>
        </div>
      </main>
      {/* Simulation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Deploy UserSense Agent</h2>
              <button className="close-btn" onClick={() => !scanning && setShowModal(false)}>&times;</button>
            </div>

            {!scanning ? (
              <div className="modal-body">
                <div className="input-group">
                  <label>Target URL</label>
                  <input
                    type="text"
                    placeholder="https://app.example.com/onboarding"
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Simulation Goal</label>
                  <textarea
                    placeholder="e.g., Navigate to checkout and verify payment button prominence"
                    value={scanGoal}
                    onChange={(e) => setScanGoal(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Select AI Agent Persona</label>
                  <div className="persona-selector-grid">
                    {[
                      { id: 'The Perfectionist', icon: '💎', desc: 'Focuses on visual polish & alignment' },
                      { id: 'The First-Timer', icon: '❓', desc: 'Prioritizes clarity & onboarding' },
                      { id: 'The Power User', icon: '⚡', desc: 'Seeks speed & efficiency' }
                    ].map(p => (
                      <div
                        key={p.id}
                        className={`persona-card ${selectedPersona === p.id ? 'active' : ''}`}
                        onClick={() => setSelectedPersona(p.id)}
                      >
                        <span className="persona-icon">{p.icon}</span>
                        <div className="persona-info">
                          <span className="persona-name">{p.id}</span>
                          <span className="persona-desc">{p.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-gradient btn-full" onClick={handleRunSimulation}>
                  Initiate Simulation Cycle
                </button>
              </div>
            ) : (
              <div className="modal-body scanning-state">
                <div className="scanner-visual">
                  <div className="scanner-ring"></div>
                  <div className="scanner-progress">{Math.round((scanStep / 3) * 100)}%</div>
                </div>
                <div className="scan-logs">
                  {scanLogs.map((log, i) => (
                    <div key={i} className="log-entry">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content report-detail-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="report-header-info">
                <h2>Audit Journey: {selectedReport.url}</h2>
                <div className="report-meta">
                  <span>{selectedReport.date}</span> • <span>Score: {selectedReport.score}</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>&times;</button>
            </div>

            <div className="modal-body report-detail-body">
              <div className="report-goal-section">
                <label>Simulation Goal</label>
                <p>"{selectedReport.goal}"</p>
              </div>

              <div className="journey-timeline">
                <h3>Agent Journey Timeline</h3>
                {selectedReport.journey && selectedReport.journey.length > 0 ? (
                  <div className="timeline-container">
                    {selectedReport.journey.map((step, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker">
                          <div className="marker-dot"></div>
                          {index < selectedReport.journey.length - 1 && <div className="marker-line"></div>}
                        </div>
                        <div className="timeline-content card glass">
                          <div className="step-info">
                            <span className="step-number">Step {index + 1}</span>
                            <span className={`step-status-tag ${step.status}`}>{step.status === 'friction_detected' ? 'Friction Found' : 'Clean Interaction'}</span>
                          </div>
                          <div className="step-visual">
                            {step.screenshot ? (
                              <img src={`http://localhost:3001/screenshots/${step.screenshot}`} alt={`Step ${index + 1}`} />
                            ) : (
                              <div className="no-visual">Screenshot loading...</div>
                            )}
                          </div>
                          <div className="step-diagnostic">
                            <div className="diagnostic-header">
                              <Activity size={14} className="text-accent" />
                              <h4>AI Trace: {step.issue || 'Analyzing behavioral patterns...'}</h4>
                            </div>
                            {step.impact && <p className="diagnostic-impact"><strong>Impact:</strong> {step.impact}</p>}
                            {step.suggestion && (
                              <div className="diagnostic-suggestion">
                                <Zap size={14} className="text-yellow" />
                                <span>{step.suggestion}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No journey steps captured for this audit.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}

export default Dashboard;
