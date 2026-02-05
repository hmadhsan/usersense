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
      <div className="workflow-canvas">
        {/* Connection Lines (SVGs or Background Elements) */}
        <div className="connection-overlay">
          <div className="line line-top"></div>
          <div className="line line-left"></div>
          <div className="line line-right"></div>
          <div className="line line-bottom"></div>
          <div className="line line-diag-tl"></div>
          <div className="line line-diag-tr"></div>
        </div>

        {/* Central Engine Hub */}
        <div className="node central-hub">
          <div className="hub-core">
            <Zap size={32} className="hub-icon" />
            <div className="hub-glow"></div>
          </div>
          <div className="node-label">Sentio Core</div>
        </div>

        {/* Behavioral Agents (Top) */}
        <div className="node-cluster agents-top">
          <div className="node secondary-node perfectionist" title="Visual & Alignment Audit">
            <Target size={20} />
            <div className="data-packet"></div>
          </div>
          <div className="node secondary-node first-timer" title="Clarity & Onboarding Audit">
            <Search size={20} />
            <div className="data-packet"></div>
          </div>
          <div className="node secondary-node power-user" title="Efficiency & Speed Audit">
            <Activity size={20} />
            <div className="data-packet"></div>
          </div>
          <div className="cluster-label">Behaviroal AI Agents</div>
        </div>

        {/* Integration Layer (Left) */}
        <div className="node-cluster integration-left">
          <div className="node secondary-node sdk" title="Client-side SDK">
            <Layers size={20} />
          </div>
          <div className="node secondary-node api" title="Bridge API">
            <Globe size={20} />
          </div>
          <div className="cluster-label">Data Integration</div>
        </div>

        {/* Analytics Hub (Right) */}
        <div className="node-cluster analytics-right">
          <div className="node secondary-node insights" title="Executive Insights">
            <Shield size={20} />
          </div>
          <div className="node secondary-node heatmap" title="Friction Heatmapping">
            <Cpu size={20} />
          </div>
          <div className="cluster-label">Executive Intelligence</div>
        </div>

        {/* Audit Cycle (Bottom) */}
        <div className="node-cluster audit-bottom">
          <div className="node secondary-node autonomous" title="Autonomous Simulation">
            <Users size={20} />
          </div>
          <div className="cluster-label">Simulation Engine</div>
        </div>
      </div>

      <div className="workflow-footer">
        <p className="text-muted text-sm uppercase tracking-widest font-bold">
          Multi-Dimensional Intelligence Architecture
        </p>
      </div>
    </div>
  );
};

export default WorkflowDiagram;
