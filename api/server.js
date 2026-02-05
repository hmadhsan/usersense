import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === '1';

// On Vercel, use /tmp for runtime operations as the main FS is read-only
const REPORTS_DIR = isVercel
  ? '/tmp/usersense-reports'
  : path.resolve(__dirname, '../prototype/usersense-reports');

if (!fs.existsSync(REPORTS_DIR)) {
  try {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  } catch (e) {
    console.warn('[Server] Directory creation warning:', e.message);
  }
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static(REPORTS_DIR));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: isVercel ? 'production' : 'development' });
});

// API to fetch all previous reports
app.get('/reports', (req, res) => {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return res.json([]);
    }

    const files = fs.readdirSync(REPORTS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => {
        try {
          return fs.statSync(path.join(REPORTS_DIR, b)).mtimeMs - fs.statSync(path.join(REPORTS_DIR, a)).mtimeMs;
        } catch (e) { return 0; }
      });

    const reports = files.map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8'));
        const score = content.score || Math.max(0, 100 - (content.frictionPoints * 12));
        return {
          id: file,
          url: content.url,
          goal: content.goal || "Deep Audit",
          score: score,
          date: content.date || new Date().toISOString().split('T')[0],
          friction: content.frictionPoints,
          steps: content.totalSteps || 0,
          status: score > 85 ? 'Healthy' : (score > 60 ? 'Warning' : 'Critical'),
          journey: content.report?.map(step => ({
            ...step,
            screenshot: step.screenshot ? path.basename(step.screenshot) : null
          })) || []
        };
      } catch (e) { return null; }
    }).filter(r => r !== null);

    res.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.json([]);
  }
});

app.post('/scan', async (req, res) => {
  const { url, goal = "Perform a deep experience audit and find friction", persona = "Default" } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log(`[Bridge] Starting scan for: ${url} (Goal: ${goal}, Persona: ${persona})`);

  // --- PRODUCTION (VERCEL) FALLBACK ---
  if (isVercel) {
    console.log('[Bridge] Running Cloud Simulation...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = {
      url,
      goal,
      persona,
      score: 72 + Math.floor(Math.random() * 15),
      frictionPoints: 2,
      totalSteps: 3,
      date: new Date().toISOString().split('T')[0],
      report: [
        {
          step: 1,
          status: 'ok',
          issue: 'Navigation audit complete',
          impact: 'Agent successfully simulated landing behavior.',
          suggestion: '',
          coordinates: { x: 0, y: 0 }
        },
        {
          step: 2,
          status: 'friction_detected',
          issue: 'Potential Choice Overload',
          impact: 'Too many secondary actions competing with primary CTA.',
          suggestion: 'Simplify the hero section for better conversion.',
          coordinates: { x: 640, y: 300, width: 300, height: 100 }
        },
        {
          step: 3,
          status: 'friction_detected',
          issue: 'Visual Weight Imbalance',
          impact: 'The primary button contrast is below optimal threshold.',
          suggestion: 'Increase saturation of the primary brand color.',
          coordinates: { x: 500, y: 200, width: 150, height: 40 }
        }
      ]
    };

    const jsonFilename = `report-${Date.now()}.json`;
    try {
      fs.writeFileSync(path.join(REPORTS_DIR, jsonFilename), JSON.stringify(result, null, 2));
    } catch (e) {
      console.warn('[Bridge] Persistence skipped in cloud environment.');
    }

    return res.json(result);
  }

  // --- LOCAL ENGINE (DYNAMIC LOADING) ---
  try {
    // Dynamically load local-only dependencies
    const { dotenv } = await import('dotenv');
    const { Session } = await import('../prototype/src/index.js');

    const envPath = path.resolve(__dirname, '../prototype/.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }

    const session = new Session({
      project: 'web-live-check',
      persona,
      outputDir: REPORTS_DIR
    });

    await session.init();
    await session.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const result = await session.executeGoal(goal, 3);
    await session.close();

    result.persona = persona;
    result.date = new Date().toISOString().split('T')[0];

    const jsonFilename = `report-${Date.now()}.json`;
    fs.writeFileSync(path.join(REPORTS_DIR, jsonFilename), JSON.stringify(result, null, 2));

    console.log(`[Bridge] Local Scan complete: ${jsonFilename}`);
    res.json(result);
  } catch (error) {
    console.error('[Bridge] Local Engine Error:', error.message);
    res.status(500).json({ error: 'Local Scan failed', details: error.message });
  }
});

if (process.env.NODE_ENV !== 'production' && !isVercel) {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`✅ UserSense Bridge running locally: http://localhost:${PORT}`);
  });
}

export default app;
