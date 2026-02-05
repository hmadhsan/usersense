# Sentio Prototype

A minimal, functional prototype for Sentio — an AI tool that simulates first-time users on web products and outputs structured friction reports.

## Quick Start

```bash
# Install dependencies
npm install

# Run the demo simulation
npm run demo
```

## How It Works

1. **Session Initialization** — Creates a headless browser session
2. **Navigation** — Visits your product pages as a first-time user
3. **Friction Detection** — Runs heuristics to detect UX issues
4. **Report Generation** — Outputs structured JSON reports

## Friction Detection Heuristics

| Check | Threshold | Issue |
|-------|-----------|-------|
| Slow page load | > 2000ms | Users abandon slow pages |
| Competing CTAs | > 2 buttons | Decision overload |
| Small buttons | < 44px | Hard to tap on mobile |
| Complex forms | > 5 fields | Users abandon long forms |
| Missing loader | > 2000ms wait | Users think it's broken |

## API Usage

```javascript
import { Session } from './src/index.js';

const session = new Session({
  project: 'my-product',
  environment: 'staging',
});

await session.init();
await session.navigateTo('https://your-product.com/signup');
await session.fillField('input[name="email"]', 'test@example.com', 'Email');
await session.clickElement('button[type="submit"]', 'Sign Up Button');

const result = session.getResult('User Signup', 'https://your-product.com');
console.log(result.report);

await session.close();
```

## Output Format

Each step generates a report matching the Sentio API format:

```json
{
  "step": 2,
  "status": "friction_detected",
  "issue": "Add to Cart button is not prominent",
  "impact": "users likely abandon at this step",
  "suggestion": "Highlight primary action and reduce distractions"
}
```

## Extending

Add new goal simulations in `src/goals/` or extend the `Session` class with custom friction detectors.

---

Built by Sentio · Product Experience Intelligence
