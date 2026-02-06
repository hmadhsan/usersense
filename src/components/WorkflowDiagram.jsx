import React from 'react';
import {
  Zap,
  Target,
  Activity,
  Shield,
  Globe,
  Cpu,
  Layers,
  Search,
  Users
} from 'lucide-react';
import './WorkflowDiagram.css';

const WorkflowDiagram = () => {
  return (
    <div className="workflow-container">
      <div className="workflow-header-section">
        <h2 className="workflow-title">How UserSense Works</h2>
        <p className="workflow-subtitle">From integration to insight in three autonomous steps.</p>
      </div>

      <div className="workflow-steps">
        {/* Step 1: Install */}
        <div className="step-card">
          <div className="step-number">01</div>
          <div className="step-icon">
            <Layers size={32} />
          </div>
          <h3>Connect</h3>
          <p>Add the SDK to your app or connect via API. It takes less than 2 minutes.</p>
          <div className="step-connector"></div>
        </div>

        {/* Step 2: Simulate */}
        <div className="step-card active-step">
          <div className="step-number">02</div>
          <div className="step-icon pulse-icon">
            <Zap size={32} />
          </div>
          <h3>Simulate</h3>
          <p>AI agents browse your site like real users, finding friction and errors.</p>
          <div className="step-connector"></div>
        </div>

        {/* Step 3: Analyze */}
        <div className="step-card">
          <div className="step-number">03</div>
          <div className="step-icon">
            <Activity size={32} />
          </div>
          <h3>Improve</h3>
          <p>Get instant reports with video evidence and code-level fix suggestions.</p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDiagram;
