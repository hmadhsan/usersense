/**
 * Sentio Reporter - HTML Generation
 */

import fs from 'fs';
import path from 'path';

export class Reporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || './usersense-reports';

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Calculate Friction Score (0-100)
   * 0 = perfect UX, 100 = critical friction
   */
  calculateScore(result) {
    const totalSteps = result.totalSteps || 1;
    const frictionPoints = result.frictionPoints || 0;

    // Weighted scoring
    let baseScore = (frictionPoints / totalSteps) * 100;

    // Penalize critical issues more (e.g., performance or form issues)
    const criticalIssues = result.report.filter(r =>
      r.issue.includes('load took') || r.issue.includes('Missing loading state')
    ).length;

    baseScore += (criticalIssues * 15);

    return Math.min(Math.round(baseScore), 100);
  }

  /**
   * Generate HTML report
   */
  generateHTML(result) {
    const score = this.calculateScore(result);
    const scoreClass = score < 20 ? 'good' : score < 50 ? 'warning' : 'critical';
    const timestamp = new Date().toLocaleString();

    const reportItems = result.report.map((item, idx) => `
      <div class="report-item ${item.status}">
        <div class="item-header">
          <span class="step-num">Step ${item.step}</span>
          <span class="status-badge ${item.status}">${item.status.replace('_', ' ')}</span>
        </div>
        
        ${item.status === 'friction_detected' ? `
          <div class="issue-content">
            <h3 class="issue-title">${item.issue}</h3>
            <p class="issue-impact"><strong>Impact:</strong> ${item.impact}</p>
            <p class="issue-suggestion"><strong>Fix:</strong> ${item.suggestion}</p>
            
            ${item.screenshot ? `
              <div class="screenshot-container">
                <img src="${path.basename(item.screenshot)}" alt="Friction evidence" class="screenshot" />
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="ok-content">
            <p>User flow proceeded without significant friction.</p>
          </div>
        `}
        
        ${item.metrics && item.metrics.fcp ? `
          <div class="item-metrics">
            <span class="metric">FCP: ${Math.round(item.metrics.fcp)}ms</span>
          </div>
        ` : ''}
      </div>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentio Friction Report - ${result.url}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #FAFAFA;
            --card: #FFFFFF;
            --text: #171717;
            --muted: #666666;
            --border: rgba(0,0,0,0.08);
            --accent: #5E6AD2;
            --success: #10B981;
            --warning: #F59E0B;
            --error: #EF4444;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Inter', sans-serif; 
            background: var(--bg); 
            color: var(--text); 
            line-height: 1.6;
            padding: 40px 20px;
        }

        .container { max-width: 800px; margin: 0 auto; }
        
        header { margin-bottom: 40px; text-align: center; }
        .logo { font-weight: 700; font-size: 24px; color: var(--accent); margin-bottom: 8px; display: block; }
        .timestamp { font-size: 14px; color: var(--muted); }

        .summary-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            gap: 40px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 8px solid var(--border);
            flex-shrink: 0;
        }
        
        .score-circle.good { border-color: var(--success); color: var(--success); }
        .score-circle.warning { border-color: var(--warning); color: var(--warning); }
        .score-circle.critical { border-color: var(--error); color: var(--error); }

        .score-value { font-size: 32px; font-weight: 700; line-height: 1; }
        .score-label { font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 4px; }

        .summary-info h1 { font-size: 20px; margin-bottom: 8px; word-break: break-all; }
        .summary-info p { font-size: 15px; color: var(--muted); }

        .report-section { display: flex; flex-direction: column; gap: 24px; }
        
        .report-item {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .step-num { font-weight: 600; font-size: 14px; color: var(--muted); }
        .status-badge { 
            font-size: 12px; 
            font-weight: 600; 
            padding: 4px 12px; 
            border-radius: 100px; 
            text-transform: uppercase; 
        }
        .status-badge.ok { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-badge.friction_detected { background: rgba(239, 68, 68, 0.1); color: var(--error); }

        .issue-title { font-size: 18px; margin-bottom: 12px; }
        .issue-impact, .issue-suggestion { font-size: 14px; margin-bottom: 8px; }
        
        .screenshot-container { margin-top: 20px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
        .screenshot { width: 100%; display: block; }

        .item-metrics { margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border); }
        .metric { font-size: 12px; color: var(--muted); font-family: monospace; }
        
        footer { margin-top: 60px; text-align: center; font-size: 14px; color: var(--muted); }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <span class="logo">Sentio</span>
            <p class="timestamp">Generated on ${timestamp}</p>
        </header>

        <div class="summary-card">
            <div class="score-circle ${scoreClass}">
                <span class="score-value">${score}</span>
                <span class="score-label">Friction Score</span>
            </div>
            <div class="summary-info">
                <h1>Friction Analysis: ${result.goal}</h1>
                <p>URL: ${result.url}</p>
                <p>Total Steps Simulated: ${result.totalSteps} | Friction Points: ${result.frictionPoints}</p>
            </div>
        </div>

        <div class="report-section">
            ${reportItems}
        </div>

        <footer>
            <p>&copy; 2026 Sentio AI. Catch friction before your users do.</p>
        </footer>
    </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Save report to disk
   */
  saveReport(result) {
    const html = this.generateHTML(result);
    const reportPath = path.join(this.outputDir, 'index.html');

    fs.writeFileSync(reportPath, html);
    console.log(`[Sentio] HTML Report generated: ${reportPath}`);

    return reportPath;
  }
}

export default Reporter;
