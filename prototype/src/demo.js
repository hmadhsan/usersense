/**
 * Sentio Demo - Simulates a signup flow on a demo page
 * 
 * This demo shows Sentio detecting friction in a real user flow.
 * Run with: npm run demo
 */

import { Session } from './index.js';

// Demo configuration
const DEMO_CONFIG = {
  // Using a simple demo signup page (httpbin for testing)
  // In production, this would be your actual product URL
  demoUrl: 'https://httpbin.org/forms/post',
  project: 'demo-product',
  environment: 'staging',
};

/**
 * Simulates a signup/form submission flow
 */
async function simulateSignupFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('  SENTIO - User Simulation Demo');
  console.log('  Goal: Complete a form submission');
  console.log('='.repeat(60) + '\n');

  const session = new Session({
    project: DEMO_CONFIG.project,
    environment: DEMO_CONFIG.environment,
  });

  try {
    await session.init();

    // Step 1: Navigate to the form page
    console.log('\n[Step 1] Navigating to form page...');
    await session.navigateTo(DEMO_CONFIG.demoUrl);
    await session.waitForResponse();

    // Step 2: Analyze form complexity
    console.log('\n[Step 2] Analyzing form...');
    const formCheck = await session.detectFormComplexity();
    if (formCheck.detected) {
      session.addReport('friction_detected', formCheck.issue, formCheck.impact, formCheck.suggestion);
    } else {
      session.addReport('ok', '', '', '');
    }

    // Step 3: Fill customer name
    console.log('\n[Step 3] Filling customer name...');
    await session.fillField('input[name="custname"]', 'Test User', 'Customer Name');

    // Step 4: Fill email (if exists)
    console.log('\n[Step 4] Looking for email field...');
    const emailField = await session.page.$('input[type="email"], input[name="email"]');
    if (emailField) {
      await session.fillField('input[type="email"], input[name="email"]', 'test@example.com', 'Email');
    } else {
      session.addReport('ok', '', '', '');
    }

    // Step 5: Select an option
    console.log('\n[Step 5] Selecting size option...');
    const sizeSelect = await session.page.$('select[name="size"]');
    if (sizeSelect) {
      await sizeSelect.selectOption('medium');
      session.addReport('ok', '', '', '');
    }

    // Step 6: Check for submit button
    console.log('\n[Step 6] Looking for submit button...');
    const submitButton = await session.page.$('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      const buttonText = await submitButton.textContent() || await submitButton.getAttribute('value');

      // Check if button text is clear
      if (!buttonText || buttonText.trim().length < 2) {
        session.addReport(
          'friction_detected',
          'Submit button has unclear or missing label',
          'users may not understand what action this performs',
          'Use descriptive button text like "Submit Order" or "Create Account"'
        );
      } else {
        session.addReport('ok', '', '', '');
      }
    } else {
      session.addReport(
        'friction_detected',
        'No submit button found',
        'users cannot complete the form',
        'Add a visible submit button'
      );
    }

    // Step 7: Attempt form submission
    console.log('\n[Step 7] Attempting form submission...');
    await session.clickElement('button[type="submit"], input[type="submit"]', 'Submit Button');

    // Get final results
    const result = session.getResult('Complete Form Submission', DEMO_CONFIG.demoUrl);

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('  SIMULATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n  Goal: ${result.goal}`);
    console.log(`  URL: ${result.url}`);
    console.log(`  Total Steps: ${result.totalSteps}`);
    console.log(`  Friction Points: ${result.frictionPoints}`);
    console.log('\n' + '-'.repeat(60));
    console.log('  DETAILED REPORT');
    console.log('-'.repeat(60) + '\n');

    // Print each step
    result.report.forEach((step, index) => {
      const icon = step.status === 'ok' ? '✓' : '✗';
      const color = step.status === 'ok' ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';

      console.log(`${color}${icon}${reset} Step ${step.step}: ${step.status.toUpperCase()}`);

      if (step.issue) {
        console.log(`    Issue: ${step.issue}`);
        console.log(`    Impact: ${step.impact}`);
        console.log(`    Suggestion: ${step.suggestion}`);
      }
      console.log('');
    });

    // Print JSON output (matching landing page format)
    console.log('-'.repeat(60));
    console.log('  JSON OUTPUT (API Format)');
    console.log('-'.repeat(60) + '\n');

    // Show individual friction points in API format
    const frictionReports = result.report.filter(r => r.status === 'friction_detected');
    if (frictionReports.length > 0) {
      frictionReports.forEach(report => {
        console.log(JSON.stringify(report, null, 2));
        console.log('');
      });
    } else {
      console.log('No friction detected! Flow is smooth.\n');
    }

    // Print summary
    console.log('='.repeat(60));
    if (result.frictionPoints > 0) {
      console.log(`  ⚠ ${result.frictionPoints} friction point(s) detected`);
      console.log('  Users may struggle to complete this flow.');
    } else {
      console.log('  ✓ Flow appears smooth');
      console.log('  No major friction points detected.');
    }
    console.log('='.repeat(60) + '\n');

    await session.close();
    return result;

  } catch (error) {
    console.error('\n[Sentio] Error during simulation:', error.message);
    await session.close();
    throw error;
  }
}

// Run the demo
simulateSignupFlow()
  .then(result => {
    console.log('[Sentio] Demo complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('[Sentio] Demo failed:', error);
    process.exit(1);
  });
