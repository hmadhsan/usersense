/**
 * Sentio AI Check - Analyze any URL with AI-powered friction detection
 * 
 * Usage: 
 *   Set your API key: set GEMINI_API_KEY=your-key-here
 *   Run: node src/ai-check.js <url>
 * 
 * Get your free API key at: https://aistudio.google.com/app/apikey
 */

import { chromium } from 'playwright';
import { AIAnalyzer } from './ai-analyzer.js';

const url = process.argv[2];
const apiKey = process.env.GEMINI_API_KEY;

if (!url) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  SENTIO AI - Intelligent Friction Analysis                ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  1. Get your free API key at: https://aistudio.google.com/app/apikey
  
  2. Set the API key:
     Windows:  set GEMINI_API_KEY=your-key-here
     Mac/Linux: export GEMINI_API_KEY=your-key-here
  
  3. Run analysis:
     node src/ai-check.js https://example.com

Examples:
  node src/ai-check.js https://stripe.com
  node src/ai-check.js https://linear.app
  node src/ai-check.js http://localhost:3000
`);
  process.exit(0);
}

if (!apiKey) {
  console.error(`
❌ Missing API key!

1. Get your free key at: https://aistudio.google.com/app/apikey
2. Set it in your terminal:
   
   Windows:  set GEMINI_API_KEY=your-key-here
   Mac/Linux: export GEMINI_API_KEY=your-key-here

3. Run this command again
`);
  process.exit(1);
}

async function analyzeWithAI(targetUrl) {
  console.log('\n' + '='.repeat(60));
  console.log('  SENTIO AI - Intelligent Friction Analysis');
  console.log('='.repeat(60));
  console.log(`\n  Target: ${targetUrl}\n`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    // Initialize AI
    const ai = new AIAnalyzer(apiKey);

    // Navigate to page
    console.log('[1/3] Navigating to page...');
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Analyze with AI
    console.log('[2/3] Taking screenshot...');
    console.log('[3/3] Analyzing with Gemini AI...\n');

    const issues = await ai.analyzePage(page, targetUrl);

    // Print results
    console.log('='.repeat(60));
    console.log('  AI ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n  URL: ${targetUrl}`);
    console.log(`  Issues Found: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n' + '-'.repeat(60));
      console.log('  FRICTION POINTS (AI-Detected)');
      console.log('-'.repeat(60) + '\n');

      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue.issue}`);
        console.log(`     Impact: ${issue.impact}`);
        console.log(`     Fix: ${issue.suggestion}\n`);
      });
    } else {
      console.log('\n  ✓ No major friction points detected!\n');
    }

    // JSON output
    console.log('-'.repeat(60));
    console.log('  JSON REPORT');
    console.log('-'.repeat(60));
    console.log(JSON.stringify({
      url: targetUrl,
      frictionPoints: issues.length,
      issues,
    }, null, 2));

    await browser.close();

  } catch (error) {
    console.error('\n[Error]', error.message);
    await browser.close();
    process.exit(1);
  }
}

analyzeWithAI(url);
