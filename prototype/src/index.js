/**
 * UserSense SDK - Core Module
 * 
 * Simulates first-time users on web products and detects friction points.
 * Generates structured reports matching the UserSense API format.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { AIAnalyzer } from './AIAnalyzer.js';

/**
 * @typedef {Object} FrictionReport
 * @property {number} step - Step number in the flow
 * @property {'ok' | 'friction_detected'} status - Status of this step
 * @property {string} issue - Description of the issue (empty if ok)
 * @property {string} impact - Expected user impact
 * @property {string} suggestion - Recommended fix
 * @property {string} screenshot - Path to screenshot if friction detected
 * @property {Object} metrics - Performance metrics for this step
 */

/**
 * @typedef {Object} SimulationResult
 * @property {string} goal - The goal that was simulated
 * @property {string} url - Target URL
 * @property {number} totalSteps - Total steps in the flow
 * @property {number} frictionPoints - Number of friction points detected
 * @property {FrictionReport[]} report - Detailed step-by-step report
 */

// Friction detection thresholds
const THRESHOLDS = {
  SLOW_RESPONSE_MS: 2000,      // Button click taking > 2s
  HESITATION_MS: 3000,         // User would hesitate > 3s
  MAX_COMPETING_CTAS: 2,       // More than 2 CTAs = confusion
  MIN_BUTTON_SIZE: 44,         // Minimum touch target size (px)
  MAX_FORM_FIELDS: 5,          // Too many fields = friction
  MIN_CONTRAST_RATIO: 4.5,     // WCAG AA requirement
  RAGE_CLICK_THRESHOLD: 4,     // 4+ clicks in short time
};

/**
 * Sentio Session - Main simulation engine
 */
export class Session {
  constructor(options = {}) {
    this.project = options.project || 'default';
    this.environment = options.environment || 'production';
    this.baseUrl = options.baseUrl || null;
    this.browser = null;
    this.page = null;
    this.stepCounter = 0;
    this.reports = [];
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.outputDir = options.outputDir || path.resolve(__dirname, '../usersense-reports');
    this.persona = options.persona || 'Default';
    this.analyzer = new AIAnalyzer();
  }

  /**
   * Initialize the browser session
   */
  async init() {
    this.browser = await chromium.launch({
      headless: true,
    });
    this.page = await this.browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Set viewport to common desktop size
    await this.page.setViewportSize({ width: 1280, height: 800 });

    // Create output directory if it doesn't exist
    const fs = await import('fs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    await this.setupRageClickTracker();

    console.log(`[Sentio] Session initialized for project: ${this.project}`);
  }

  /**
   * Close the browser session
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('[Sentio] Session closed');
    }
  }

  /**
   * Add a step report with optional visual highlighting
   */
  async addReport(status, issue = '', impact = '', suggestion = '', coordinates = null) {
    this.stepCounter++;
    const step = this.stepCounter;
    let screenshotName = null;
    let metrics = { domLoaded: 0, loadTime: 0 };

    if (status === 'friction_detected') {
      // If we have coordinates, draw a red box on the page first
      if (coordinates && this.page) {
        await this.drawHighlight(coordinates);
      }

      const timestamp = Date.now();
      screenshotName = `step-${step}-${timestamp}.png`;
      const screenshotPath = path.join(this.outputDir, screenshotName);

      if (this.page) {
        await this.page.screenshot({ path: screenshotPath });
        // Clean up highlight after screenshot
        if (coordinates) {
          await this.clearHighlights();
        }
      }
    }

    // Try to get performance metrics
    if (this.page) {
      try {
        metrics = await this.page.evaluate(() => {
          const perf = window.performance.getEntriesByType('navigation')[0];
          return {
            domLoaded: perf?.domContentLoadedEventEnd || 0,
            loadTime: perf?.loadEventEnd || 0,
            fcp: window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          };
        });
      } catch (e) {
        // Ignore if metrics fail
      }
    }

    this.reports.push({
      step,
      status,
      issue,
      impact,
      suggestion,
      screenshot: screenshotName ? path.join('sentio-reports', screenshotName) : null,
      metrics,
      coordinates
    });
  }

  /**
   * Internal helper to draw a red highlight box on the page
   */
  async drawHighlight(coords) {
    await this.page.evaluate((c) => {
      const div = document.createElement('div');
      div.id = 'sentio-highlight';
      div.style.position = 'absolute';
      div.style.left = `${c.x - (c.width || 40) / 2}px`;
      div.style.top = `${c.y - (c.height || 40) / 2}px`;
      div.style.width = `${c.width || 80}px`;
      div.style.height = `${c.height || 80}px`;
      div.style.border = '4px solid #EF4444';
      div.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
      div.style.borderRadius = '8px';
      div.style.zIndex = '1000000';
      div.style.pointerEvents = 'none';
      div.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)';
      document.body.appendChild(div);
    }, coords);
  }

  /**
   * Clean up visual highlights
   */
  async clearHighlights() {
    await this.page.evaluate(() => {
      const highlights = document.querySelectorAll('#sentio-highlight');
      highlights.forEach(h => h.remove());
    });
  }

  /**
   * Detect friction: Competing CTAs
   */
  async detectCompetingCTAs() {
    const buttons = await this.page.$$('button, [role="button"], a.btn, a.button, .cta');
    const visibleButtons = [];

    for (const btn of buttons) {
      const isVisible = await btn.isVisible();
      if (isVisible) {
        const box = await btn.boundingBox();
        if (box) visibleButtons.push(btn);
      }
    }

    if (visibleButtons.length > THRESHOLDS.MAX_COMPETING_CTAS) {
      return {
        detected: true,
        count: visibleButtons.length,
        issue: `${visibleButtons.length} competing CTAs detected on page`,
        impact: 'users may feel overwhelmed and abandon',
        suggestion: 'Reduce to a single primary action per section',
      };
    }

    return { detected: false };
  }

  /**
   * Detect friction: Button too small
   */
  async detectSmallButtons() {
    const buttons = await this.page.$$('button, [role="button"], a.btn');

    for (const btn of buttons) {
      const box = await btn.boundingBox();
      if (box && (box.width < THRESHOLDS.MIN_BUTTON_SIZE || box.height < THRESHOLDS.MIN_BUTTON_SIZE)) {
        const text = await btn.textContent();
        return {
          detected: true,
          issue: `Button "${text?.trim()}" is too small (${Math.round(box.width)}x${Math.round(box.height)}px)`,
          impact: 'users may have difficulty clicking on mobile',
          suggestion: `Increase button size to at least ${THRESHOLDS.MIN_BUTTON_SIZE}px`,
        };
      }
    }

    return { detected: false };
  }

  /**
   * Detect friction: Missing loading state
   */
  async detectMissingLoadingState(action) {
    const startTime = Date.now();

    // Perform action and wait
    await action();

    const elapsed = Date.now() - startTime;

    if (elapsed > THRESHOLDS.SLOW_RESPONSE_MS) {
      // Check if any loading indicator appeared
      const hasLoader = await this.page.$('.loading, .spinner, [aria-busy="true"], .loader');

      if (!hasLoader) {
        return {
          detected: true,
          elapsed,
          issue: `No loading feedback during ${elapsed}ms wait`,
          impact: 'users may think the action failed and retry',
          suggestion: 'Add a loading indicator for actions taking > 500ms',
        };
      }
    }

    return { detected: false };
  }

  /**
   * Detect friction: Too many form fields
   */
  async detectFormComplexity() {
    const inputs = await this.page.$$('input:visible, select:visible, textarea:visible');

    if (inputs.length > THRESHOLDS.MAX_FORM_FIELDS) {
      return {
        detected: true,
        count: inputs.length,
        issue: `Form has ${inputs.length} fields (threshold: ${THRESHOLDS.MAX_FORM_FIELDS})`,
        impact: 'users likely abandon long forms',
        suggestion: 'Split into multiple steps or remove optional fields',
      };
    }

    return { detected: false };
  }

  /**
   * Detect friction: Unclear primary action
   */
  async detectUnclearPrimaryAction() {
    const primaryButtons = await this.page.$$('button[type="submit"], .btn-primary, .primary-btn, button.primary');

    if (primaryButtons.length === 0) {
      // Check for any prominent buttons
      const allButtons = await this.page.$$('button:visible');
      if (allButtons.length > 0) {
        return {
          detected: true,
          issue: 'No clearly styled primary action button',
          impact: 'users may not know what to do next',
          suggestion: 'Style the main action button distinctly (color, size)',
        };
      }
    }

    return { detected: false };
  }

  /**
   * Detect friction: Accessibility issues (alt text)
   */
  async detectAccessibilityIssues() {
    const images = await this.page.$$('img:visible');
    let missingAlt = 0;

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        missingAlt++;
      }
    }

    if (missingAlt > 0) {
      return {
        detected: true,
        issue: `${missingAlt} images missing alt text`,
        impact: 'users with screen readers cannot understand the content',
        suggestion: 'Add descriptive alt text to all informative images',
      };
    }

    return { detected: false };
  }

  /**
   * Navigate to a URL and analyze the page
   */
  async navigateTo(url) {
    console.log(`[Sentio] Navigating to: ${url}`);

    const startTime = Date.now();
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // Check page load time
    if (loadTime > THRESHOLDS.SLOW_RESPONSE_MS) {
      await this.addReport(
        'friction_detected',
        `Page load took ${loadTime}ms`,
        'users may abandon slow-loading pages',
        'Optimize page load time to under 2 seconds'
      );
    } else {
      await this.addReport('ok', '', '', '');
    }

    // Run page-level friction checks
    const ctaCheck = await this.detectCompetingCTAs();
    if (ctaCheck.detected) {
      await this.addReport('friction_detected', ctaCheck.issue, ctaCheck.impact, ctaCheck.suggestion);
    }

    const buttonCheck = await this.detectSmallButtons();
    if (buttonCheck.detected) {
      await this.addReport('friction_detected', buttonCheck.issue, buttonCheck.impact, buttonCheck.suggestion);
    }

    const primaryCheck = await this.detectUnclearPrimaryAction();
    if (primaryCheck.detected) {
      await this.addReport('friction_detected', primaryCheck.issue, primaryCheck.impact, primaryCheck.suggestion);
    }

    const accCheck = await this.detectAccessibilityIssues();
    if (accCheck.detected) {
      await this.addReport('friction_detected', accCheck.issue, accCheck.impact, accCheck.suggestion);
    }

    const contrastCheck = await this.detectLowContrast();
    if (contrastCheck.detected) {
      await this.addReport('friction_detected', contrastCheck.issue, contrastCheck.impact, contrastCheck.suggestion);
    }

    await this.detectUserFrustration();
  }

  /**
   * Deep Visual Audit: Analyze page with GPT-4o-mini
   */
  async analyzeWithAI() {
    console.log('[Sentio AI] Starting deep visual audit...');

    // Capture screenshot for AI
    const buffer = await this.page.screenshot();

    // Extract metadata for context
    const metadata = {
      title: await this.page.title(),
      url: this.page.url(),
      viewport: this.page.viewportSize(),
    };

    const aiFindings = await this.analyzer.analyzeFriction(buffer, {
      url: metadata.url,
      metadata,
      persona: this.persona
    });

    console.log(`[Sentio AI] AI found ${aiFindings.length} intelligent friction points.`);

    for (const finding of aiFindings) {
      await this.addReport(
        'friction_detected',
        `AI Insight: ${finding.issue}`,
        finding.impact,
        finding.suggestion,
        finding.coordinates // Pass coordinates for highlighting
      );
    }
  }

  /**
   * World-Class Autonomous Agent: Accomplish a specific goal
   */
  async executeGoal(goal, maxSteps = 5) {
    console.log(`[UserSense AI] Executing target goal: "${goal}" (${maxSteps} steps max)...`);

    for (let i = 0; i < maxSteps; i++) {
      const stepNum = i + 1;
      const url = this.page.url();
      const title = await this.page.title();

      console.log(`[UserSense AI] Step ${stepNum}: Current URL: ${url}`);

      // 1. Check if goal is already completed
      const screenshot = await this.page.screenshot();
      const completionCheck = await this.analyzer.checkGoalCompletion(screenshot, { goal, url, persona: this.persona });

      if (completionCheck.completed) {
        console.log(`[UserSense AI] Goal Accomplished: ${completionCheck.reason}`);
        await this.addReport('ok', `Goal Accomplished: ${goal}`, completionCheck.reason, 'No further action needed.');
        break;
      }

      // 2. Perform deep friction audit of current state
      await this.analyzeWithAI();

      // 3. Identify next action to reach goal
      const nextAction = await this.analyzer.identifyPrimaryAction(screenshot, {
        goal,
        url,
        persona: this.persona,
        metadata: { title }
      });

      if (!nextAction || !nextAction.coordinates || nextAction.confidence < 0.5) {
        console.log('[UserSense AI] No high-confidence next step found. Ending simulation.');
        await this.addReport('friction_detected', 'Journey Dead-end', 'Agent cannot find the way to the goal.', 'Check if the navigation is intuitive or if buttons are clearly labeled.');
        break;
      }

      console.log(`[UserSense AI] Decision: ${nextAction.actionName} (Confidence: ${nextAction.confidence})`);
      console.log(`[UserSense AI] Reason: ${nextAction.reason}`);

      // 4. Execute the action
      await this.page.mouse.move(nextAction.coordinates.x, nextAction.coordinates.y);
      await this.page.mouse.click(nextAction.coordinates.x, nextAction.coordinates.y);

      // 5. Wait for transition
      await this.waitForResponse();
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for animations
    }

    console.log('[UserSense AI] Goal execution cycle finished.');
    return this.getResult(goal, this.page.url());
  }

  /**
   * Autonomous Journey Explorer: AI navigates the product (legacy exploration)
   */
  async explore(maxSteps = 3) {
    console.log(`[Sentio AI] Starting autonomous journey exploration (${maxSteps} steps)...`);

    for (let i = 0; i < maxSteps; i++) {
      console.log(`[Sentio AI] Exploration step ${i + 1}/${maxSteps}...`);

      // 1. Audit current page
      await this.analyzeWithAI();

      // 2. Ask AI where to go next
      const buffer = await this.page.screenshot();
      const nextStep = await this.analyzer.identifyPrimaryAction(buffer, {
        url: this.page.url(),
        metadata: { title: await this.page.title() }
      });

      if (!nextStep || !nextStep.coordinates) {
        console.log('[Sentio AI] No clear next step identified. Ending journey.');
        break;
      }

      console.log(`[Sentio AI] AI decided to click: "${nextStep.actionName}" - Reason: ${nextStep.reason}`);

      // 3. Move mouse and click
      await this.page.mouse.move(nextStep.coordinates.x, nextStep.coordinates.y);
      await this.page.mouse.click(nextStep.coordinates.x, nextStep.coordinates.y);

      // 4. Wait for transition
      await this.waitForResponse();

      // Small delay for animations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('[Sentio AI] Autonomous journey complete.');
  }

  /**
   * Detect friction: Low contrast text
   */
  async detectLowContrast() {
    const lowContrastCount = await this.page.evaluate((minRatio) => {
      function getLuminance(rgb) {
        const [r, g, b] = rgb.map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }

      function getContrast(rgb1, rgb2) {
        const l1 = getLuminance(rgb1) + 0.05;
        const l2 = getLuminance(rgb2) + 0.05;
        return Math.max(l1, l2) / Math.min(l1, l2);
      }

      function parseRGB(color) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
      }

      const elements = Array.from(document.querySelectorAll('p, span, button, a, h1, h2, h3'));
      let issues = 0;

      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || el.innerText.trim().length < 2) continue;

        const fg = parseRGB(style.color);
        const bg = parseRGB(style.backgroundColor);

        // Skip transparent backgrounds for this simple heuristic
        if (style.backgroundColor === 'transparent' || style.backgroundColor === 'rgba(0, 0, 0, 0)') continue;

        const ratio = getContrast(fg, bg);
        if (ratio < minRatio) {
          issues++;
          if (issues > 3) break; // Limit detection
        }
      }
      return issues;
    }, THRESHOLDS.MIN_CONTRAST_RATIO);

    if (lowContrastCount > 0) {
      return {
        detected: true,
        issue: `Multiple elements have poor text contrast (below ${THRESHOLDS.MIN_CONTRAST_RATIO}:1)`,
        impact: 'users with visual impairments or in bright light will struggle to read',
        suggestion: 'Increase contrast ratio between text and background to at least 4.5:1',
      };
    }

    return { detected: false };
  }

  /**
   * Detect friction: Rage Clicks during simulation
   */
  async setupRageClickTracker() {
    await this.page.evaluate((threshold) => {
      window._sentioRageClicks = 0;
      let lastClick = { time: 0, x: 0, y: 0 };
      let rapidClicks = 0;

      document.addEventListener('mousedown', (e) => {
        const now = Date.now();
        const dist = Math.sqrt(Math.pow(e.clientX - lastClick.x, 2) + Math.pow(e.clientY - lastClick.y, 2));

        if (now - lastClick.time < 500 && dist < 30) {
          rapidClicks++;
          if (rapidClicks >= threshold) {
            window._sentioRageClicks++;
            rapidClicks = 0;
          }
        } else {
          rapidClicks = 0;
        }
        lastClick = { time: now, x: e.clientX, y: e.clientY };
      });
    }, THRESHOLDS.RAGE_CLICK_THRESHOLD);
  }

  /**
   * Detect friction: User frustration (rage clicks)
   */
  async detectUserFrustration() {
    const count = await this.page.evaluate(() => window._sentioRageClicks || 0);
    if (count > 0) {
      return {
        detected: true,
        issue: 'Rage clicks detected',
        impact: 'users are clicking frantically in frustration',
        suggestion: 'Check if elements are responsive or if the UI is misleading',
      };
    }
    return { detected: false };
  }

  /**
   * Attempt to click a button/link
   */
  async clickElement(selector, description = 'element') {
    console.log(`[Sentio] Clicking: ${description}`);

    try {
      const element = await this.page.$(selector);

      if (!element) {
        await this.addReport(
          'friction_detected',
          `Could not find ${description}`,
          'users cannot complete this action',
          `Ensure ${description} is visible and accessible`
        );
        return false;
      }

      const isVisible = await element.isVisible();
      if (!isVisible) {
        await this.addReport(
          'friction_detected',
          `${description} is not visible`,
          'users cannot see or click this element',
          'Make sure the element is visible without scrolling'
        );
        return false;
      }

      // Click and detect loading issues
      const loadingCheck = await this.detectMissingLoadingState(async () => {
        await element.click();
        await this.page.waitForTimeout(500); // Brief wait for response
      });

      if (loadingCheck.detected) {
        await this.addReport('friction_detected', loadingCheck.issue, loadingCheck.impact, loadingCheck.suggestion);
      } else {
        await this.addReport('ok', '', '', '');
      }

      return true;
    } catch (error) {
      this.addReport(
        'friction_detected',
        `Error clicking ${description}: ${error.message}`,
        'action failed unexpectedly',
        'Check element accessibility and event handlers'
      );
      return false;
    }
  }

  /**
   * Fill a form field
   */
  async fillField(selector, value, fieldName = 'field') {
    console.log(`[Sentio] Filling: ${fieldName}`);

    try {
      const field = await this.page.$(selector);

      if (!field) {
        this.addReport(
          'friction_detected',
          `Could not find ${fieldName}`,
          'users cannot complete this form',
          `Ensure ${fieldName} input is present and accessible`
        );
        return false;
      }

      await field.fill(value);
      await this.addReport('ok', '', '', '');
      return true;
    } catch (error) {
      this.addReport(
        'friction_detected',
        `Error filling ${fieldName}: ${error.message}`,
        'form submission may fail',
        'Check input field configuration'
      );
      return false;
    }
  }

  /**
   * Wait for navigation or response
   */
  async waitForResponse(timeout = 5000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch {
      // Timeout is not necessarily an error
    }
  }

  /**
   * Get the final simulation result
   */
  getResult(goal, url) {
    const frictionPoints = this.reports.filter(r => r.status === 'friction_detected').length;

    return {
      goal,
      url,
      totalSteps: this.stepCounter,
      frictionPoints,
      report: this.reports,
    };
  }
}

/**
 * Convenience function matching the landing page API
 */
export async function simulateGoal(goalName, options = {}) {
  const session = new Session(options);
  await session.init();

  try {
    if (options.baseUrl) {
      await session.page.goto(options.baseUrl, { waitUntil: 'networkidle' });
    }

    const result = await session.executeGoal(goalName, options.maxSteps || 5);
    await session.close();
    return result;
  } catch (error) {
    console.error(`[UserSense] Error during goal simulation: ${error.message}`);
    await session.close();
    throw error;
  }
}

export default { Session, simulateGoal };
