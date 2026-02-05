import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Session } from '../prototype/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === '1';

// On Vercel, use /tmp for runtime operations as the main FS is read-only
const REPORTS_DIR = isVercel
  ? '/tmp/usersense-reports'
  : path.resolve(__dirname, '../prototype/usersense-reports');

if (isVercel && !fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Load .env from the prototype directory where the user stored the key
dotenv.config({ path: path.resolve(__dirname, '../prototype/.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static(REPORTS_DIR));

// API to fetch all previous reports
app.get('/reports', async (req, res) => {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return res.json([]);
    }

    const files = fs.readdirSync(REPORTS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => fs.statSync(path.join(REPORTS_DIR, b)).mtimeMs - fs.statSync(path.join(REPORTS_DIR, a)).mtimeMs);

    const reports = files.map(file => {
      const content = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8'));
      const score = content.score || Math.max(0, 100 - (content.frictionPoints * 12));
      return {
        id: file,
        url: content.url,
        goal: content.goal || "Deep Audit",
        score: score,
        date: fs.statSync(path.join(REPORTS_DIR, file)).mtime.toISOString().split('T')[0],
        friction: content.frictionPoints,
        steps: content.totalSteps || 0,
        status: score > 85 ? 'Healthy' : (score > 60 ? 'Warning' : 'Critical'),
        // Rich journey data
        journey: content.report?.map(step => ({
          ...step,
          screenshot: step.screenshot ? path.basename(step.screenshot) : null
        })) || []
      };
    });

    res.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.json([]); // Return empty array instead of 500 on FS errors in production
  }
});

console.log('🚀 UserSense Bridge API starting...');

app.post('/scan', async (req, res) => {
  const { url, goal = "Perform a deep experience audit and find friction", persona = "Default" } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log(`[Bridge] Starting scan for: ${url} (Goal: ${goal}, Persona: ${persona})`);

  // Cloud Demo Mode for Vercel (where Playwright binaries are usually missing)
  if (isVercel) {
    console.log('[Bridge] Vercel environment detected. Running Cloud Simulation...');

    // Simulate a slight AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const result = {
      url,
      goal,
      persona,
      score: 65 + Math.floor(Math.random() * 25),
      frictionPoints: 2 + Math.floor(Math.random() * 3),
      totalSteps: 4,
      report: [
        {
          step: 1,
          status: 'ok',
          issue: '',
          impact: 'Navigating to target environment...',
          suggestion: '',
          coordinates: { x: 0, y: 0 }
        },
        {
          step: 2,
          status: 'friction_detected',
          issue: 'High Cognitive Load detected in Navigation',
          impact: 'Users take 3.2s longer than average to identify the primary CTA.',
          suggestion: 'Increase visual weight of the primary button.',
          coordinates: { x: 640, y: 40, width: 200, height: 50 }
        },
        {
          step: 3,
          status: 'friction_detected',
          issue: 'Rage Clicking on Non-Interactive Element',
          impact: 'Potential frustration found on section headers.',
          suggestion: 'Check if headers are misleadingly styled as links.',
          coordinates: { x: 320, y: 450, width: 400, height: 100 }
        },
        {
          step: 4,
          status: 'ok',
          issue: 'Simulation Complete',
          impact: 'Deep Behavioral Trace stored.',
          suggestion: 'Ready for deep dive.',
          coordinates: { x: 0, y: 0 }
        }
      ]
    };

    // Persist JSON for Dashboard visualization
    const jsonFilename = `report-${Date.now()}.json`;
    try {
      fs.writeFileSync(path.join(REPORTS_DIR, jsonFilename), JSON.stringify(result, null, 2));
    } catch (e) {
      console.warn('[Bridge] Failed to persist report to /tmp:', e.message);
    }

    return res.json(result);
  }

  // Local Engine (Real Playwright)
  const session = new Session({
    project: 'web-live-check',
    persona,
    outputDir: REPORTS_DIR
  });

  try {
    await session.init();
    await session.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const result = await session.executeGoal(goal, 3);
    await session.close();

    result.persona = persona;
    const jsonOutput = JSON.stringify(result, null, 2);
    const jsonFilename = `report-${Date.now()}.json`;
    fs.writeFileSync(path.join(REPORTS_DIR, jsonFilename), jsonOutput);

    console.log(`[Bridge] Local Scan complete. Persisted: ${jsonFilename}`);
    res.json(result);
  } catch (error) {
    console.error('[Bridge] Local Scan failed:', error.message);
    if (session) try { await session.close(); } catch (e) { }
    res.status(500).json({ error: 'Scan failed', details: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ UserSense Bridge API running on http://localhost:${PORT}`);
  });
}

export default app;
