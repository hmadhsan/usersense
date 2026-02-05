#!/usr/bin/env node
/**
 * UserSense CLI - Check any URL for friction
 * 
 * Usage: usersense check <url>
 * Example: usersense check https://your-product.com/signup
 */

import { Session } from './index.js';
import { Reporter } from './Reporter.js';

const url = process.argv[2];
const shouldReport = process.argv.includes('--report');
const useAI = process.argv.includes('--ai');
const exploreIndex = process.argv.indexOf('--explore');
const exploreSteps = exploreIndex !== -1 ? parseInt(process.argv[exploreIndex + 1]) : 0;

if (!url) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  SENTIO - Product Experience Intelligence                 ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  node src/check.js <url> [options]

Options:
  --report    Generate a visual HTML report with screenshots
  --ai        Run deep visual audit using GPT-4o-mini
  --explore N Run autonomous exploration for N steps (e.g. --explore 3)

Examples:
  node src/check.js https://example.com --report --ai
  node src/check.js https://your-product.com --explore 3 --report

The tool will:
  1. Open the URL as a first-time user
  2. Analyze the page for friction points
  3. Explore user journeys autonomously
  4. Output a structured JSON report
`);
  process.exit(0);
}

async function checkUrl(targetUrl) {
  console.log('\n' + '='.repeat(60));
  console.log('  SENTIO - Friction Analysis');
  console.log('='.repeat(60));
  console.log(`\n  Target: ${targetUrl}\n`);

  const session = new Session({
    project: 'cli-check',
    environment: 'production',
  });

  try {
    await session.init();

    // Navigate and analyze
    console.log('[1/5] Navigating to page...');
    await session.navigateTo(targetUrl);
    await session.waitForResponse();

    // Check for user frustration (rage clicks)
    console.log('[2/5] Analyzing interactions & forms...');
    await session.detectUserFrustration();

    const formCheck = await session.detectFormComplexity();
    if (formCheck.detected) {
      await session.addReport('friction_detected', formCheck.issue, formCheck.impact, formCheck.suggestion);
    }

    // Check for competing CTAs
    console.log('[3/5] Checking CTA hierarchy...');
    const ctaCheck = await session.detectCompetingCTAs();
    if (ctaCheck.detected) {
      await session.addReport('friction_detected', ctaCheck.issue, ctaCheck.impact, ctaCheck.suggestion);
    }

    // Check primary action clarity
    console.log('[4/5] Analyzing primary action clarity...');
    const primaryCheck = await session.detectUnclearPrimaryAction();
    if (primaryCheck.detected) {
      await session.addReport('friction_detected', primaryCheck.issue, primaryCheck.impact, primaryCheck.suggestion);
    }

    // AI Exploration/Journey
    if (exploreSteps > 0) {
      console.log(`[5 / 5] Launching autonomous explorer(${exploreSteps} steps)...`);
      await session.explore(exploreSteps);
    } else if (useAI) {
      console.log('[5/5] Running deep AI visual audit...');
      await session.analyzeWithAI();
    } else {
      console.log('[5/5] Skipping AI audit (use --ai or --explore N to enable)');
    }

    // Get results
    const result = session.getResult('Page Analysis', targetUrl);

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('  ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n  URL: ${result.url}`);
    console.log(`  Checks: ${result.totalSteps}`);
    console.log(`  Friction Points: ${result.frictionPoints}`);

    if (result.frictionPoints > 0) {
      console.log('\n' + '-'.repeat(60));
      console.log('  ISSUES FOUND');
      console.log('-'.repeat(60) + '\n');

      result.report
        .filter(r => r.status === 'friction_detected')
        .forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue.issue} `);
          console.log(`     Impact: ${issue.impact} `);
          console.log(`     Fix: ${issue.suggestion} \n`);
        });
    } else {
      console.log('\n  ✓ No major friction points detected!\n');
    }

    // JSON output & persistence
    console.log('-'.repeat(60));
    console.log('  JSON REPORT');
    console.log('-'.repeat(60));
    const jsonOutput = JSON.stringify(result, null, 2);
    console.log(jsonOutput);

    // Persist JSON for the Dashboard API
    const fs = await import('fs');
    const path = await import('path');
    const jsonFilename = `report-${Date.now()}.json`;
    fs.writeFileSync(path.join(session.outputDir, jsonFilename), jsonOutput);
    console.log(`\n  [UserSense] JSON Data persisted for Dashboard: ${jsonFilename}`);

    // HTML output
    if (shouldReport) {
      const reporter = new Reporter({ outputDir: session.outputDir });
      const reportPath = reporter.saveReport(result);
      console.log('\n' + '='.repeat(60));
      console.log('  VISUAL REPORT GENERATED');
      console.log('='.repeat(60));
      console.log(`  Path: ${reportPath} \n`);
    }

    await session.close();
    return result;

  } catch (error) {
    console.error('\n[Error]', error.message);
    await session.close();
    process.exit(1);
  }
}

checkUrl(url);
