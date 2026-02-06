import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- LOCAL DEV SERVER ---
// This file is for LOCAL DEVELOPMENT ONLY.
// Vercel uses api/index.js instead.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.resolve(__dirname, '../prototype/usersense-reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Load local-only dependencies (safe here because Vercel doesn't run this file)
import dotenv from 'dotenv';
import { Session } from '../prototype/src/index.js';

const envPath = path.resolve(__dirname, '../prototype/.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static(REPORTS_DIR));

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: 'local-dev', time: new Date().toISOString() });
});

router.get('/reports', (req, res) => {
  try {
    if (!fs.existsSync(REPORTS_DIR)) return res.json([]);
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => {
        try { return fs.statSync(path.join(REPORTS_DIR, b)).mtimeMs - fs.statSync(path.join(REPORTS_DIR, a)).mtimeMs; } catch (_) { return 0; }
      });
    const reports = files.map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8'));
        return {
          id: file,
          url: content.url,
          goal: content.goal,
          score: content.score || 80,
          date: content.date || new Date().toISOString().split('T')[0],
          friction: content.frictionPoints || 0,
          steps: content.totalSteps || 0,
          status: (content.score || 80) > 85 ? 'Healthy' : 'Warning',
          journey: content.report || []
        };
      } catch (_) { return null; }
    }).filter(Boolean);
    res.json(reports);
  } catch (e) { res.json([]); }
});

router.post('/scan', async (req, res) => {
  const { url, goal = "Audit", persona = "Default" } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  console.log(`[Local Bridge] Starting FULL scan for: ${url}`);

  try {
    const session = new Session({ project: 'web-live-check', persona, outputDir: REPORTS_DIR });
    await session.init();
    await session.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const result = await session.executeGoal(goal, 3);
    await session.close();

    result.persona = persona;
    result.date = new Date().toISOString().split('T')[0];

    fs.writeFileSync(path.join(REPORTS_DIR, `report-${Date.now()}.json`), JSON.stringify(result, null, 2));
    console.log(`[Local Bridge] Scan complete.`);
    res.json(result);
  } catch (error) {
    console.error('[Local Bridge] Error:', error.message);
    res.status(500).json({ error: 'Local Scan Failed', details: error.message });
  }
});

app.use('/api', router);
app.use('/', router);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ UserSense Bridge (Local) running on http://localhost:${PORT}`);
});

export default app;
