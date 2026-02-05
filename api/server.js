import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Session } from '../prototype/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.resolve(__dirname, '../prototype/usersense-reports');

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

  console.log(`[Bridge] Starting autonomous scan for: ${url} (Goal: ${goal}, Persona: ${persona})`);

  const session = new Session({
    project: 'web-live-check',
    persona,
    outputDir: path.resolve(__dirname, '../prototype/usersense-reports')
  });

  try {
    await session.init();
    await session.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Use the new world-class autonomous engine
    const result = await session.executeGoal(goal, 3);
    await session.close();

    // Persist JSON for Dashboard visualization
    // Add persona to the result before saving
    result.persona = persona;
    const jsonOutput = JSON.stringify(result, null, 2);
    const jsonFilename = `report-${Date.now()}.json`;
    fs.writeFileSync(path.join(REPORTS_DIR, jsonFilename), jsonOutput);

    console.log(`[Bridge] Scan complete. Found ${result.frictionPoints} friction points. Persisted: ${jsonFilename}`);
    res.json(result);
  } catch (error) {
    console.error('[Bridge] Scan failed:', error.message);
    if (session) await session.close();
    res.status(500).json({ error: 'Scan failed', details: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ UserSense Bridge API running on http://localhost:${PORT}`);
  });
}

export default app;
