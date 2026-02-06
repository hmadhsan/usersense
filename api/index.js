import express from 'express';
import cors from 'cors';
import fs from 'fs';

// --- VERCEL ENTRY POINT ---
// This file has ZERO dependencies on local Playwright/prototypes
// It is guaranteed to be safe for serverless execution

const app = express();
app.use(cors());
app.use(express.json());

// On Vercel, we MUST use /tmp
const REPORTS_DIR = '/tmp/usersense-reports';

if (!fs.existsSync(REPORTS_DIR)) {
  try {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  } catch (e) {
    console.warn('[Vercel] Directory creation warning:', e.message);
  }
}

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'production-cloud',
    time: new Date().toISOString(),
    reports_dir: REPORTS_DIR
  });
});

router.get('/ping', (req, res) => res.send('pong'));

router.get('/reports', (req, res) => {
  try {
    if (!fs.existsSync(REPORTS_DIR)) return res.json([]);
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => {
        try { return fs.statSync(`${REPORTS_DIR}/${b}`).mtimeMs - fs.statSync(`${REPORTS_DIR}/${a}`).mtimeMs; }
        catch (_) { return 0; }
      });

    const reports = files.map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(`${REPORTS_DIR}/${file}`, 'utf8'));
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
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.json([]);
  }
});

// --- WAITLIST ENDPOINT ---
router.post('/waitlist', (req, res) => {
  const { name = 'Anonymous', email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // In a real Vercel app, you'd save to a DB
  console.log(`[Waitlist] New signup: ${name} <${email}>`);

  // Optional: Save to temp file (CSV Format)
  try {
    const filePath = `${REPORTS_DIR}/waitlist.csv`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, 'Timestamp,Name,Email\n');
    }
    const csvLine = `"${new Date().toISOString()}","${name.replace(/"/g, '""')}","${email.replace(/"/g, '""')}"\n`;
    fs.appendFileSync(filePath, csvLine);
  } catch (e) {
    // Ignore
  }

  res.json({ success: true, message: "Added to waitlist" });
});

router.post('/scan', async (req, res) => {
  const { url, goal = "User Experience Audit", persona = "Default" } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  // PURE CLOUD SIMULATION (No Playwright)
  console.log(`[Cloud Agent] Simulating scan for: ${url}`);

  await new Promise(resolve => setTimeout(resolve, 2500));

  const result = {
    url, goal, persona,
    score: 78 + Math.floor(Math.random() * 15),
    frictionPoints: 1,
    totalSteps: 2,
    date: new Date().toISOString().split('T')[0],
    report: [
      { step: 1, status: 'ok', issue: 'Site Reachable', impact: 'Agent successfully navigated to target.', suggestion: '', coordinates: { x: 0, y: 0 } },
      { step: 2, status: 'friction_detected', issue: 'Accessibility Warning', impact: 'Contrast ratio on secondary buttons is low.', suggestion: 'Use a darker shade for better readability.', coordinates: { x: 50, y: 120, width: 200, height: 60 } }
    ]
  };

  try {
    const filename = `report-${Date.now()}.json`;
    fs.writeFileSync(`${REPORTS_DIR}/${filename}`, JSON.stringify(result, null, 2));
  } catch (e) {
    console.warn('[Vercel] Write failed:', e.message);
  }

  res.json(result);
});

// Mount router on both paths to be safe
app.use('/api', router);
app.use('/', router);

export default app;
