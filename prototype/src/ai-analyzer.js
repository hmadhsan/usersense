/**
 * Sentio AI Analyzer - Uses Google Gemini for intelligent UX analysis
 * Uses direct REST API for better compatibility
 */

import fs from 'fs';
import path from 'path';

const ANALYSIS_PROMPT = `You are Sentio, an AI that analyzes web pages for user experience friction.

Look at this screenshot and identify UX issues that would cause a first-time user to:
- Get confused
- Abandon the page
- Make mistakes
- Feel frustrated

For each issue found, respond in this exact JSON format (array of objects):
[
  {
    "issue": "Brief description of the problem",
    "impact": "How this affects the user",
    "suggestion": "Specific fix recommendation"
  }
]

Be specific and actionable. Focus on real problems, not minor nitpicks.
If the page looks good, return an empty array: []

Analyze the screenshot now:`;

export class AIAnalyzer {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key required. Get one free at: https://aistudio.google.com/app/apikey');
    }
    this.apiKey = apiKey;
    // Try multiple model names in order of preference
    this.models = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.0-pro-vision',
      'gemini-pro-vision'
    ];
  }

  /**
   * Try to call API with different model names
   */
  async callAPI(base64Image, mimeType) {
    for (const model of this.models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: ANALYSIS_PROMPT },
                { inline_data: { mime_type: mimeType, data: base64Image } }
              ]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[AI] Using model: ${model}`);
          return data;
        }

        // If 404, try next model
        if (response.status === 404) continue;

        // Other errors, throw
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP ${response.status}`);

      } catch (e) {
        if (e.message.includes('not found')) continue;
        throw e;
      }
    }

    throw new Error('No compatible Gemini model found. Try updating your API key access.');
  }

  /**
   * Analyze a screenshot using Gemini Vision
   */
  async analyzeScreenshot(screenshotPath) {
    console.log('[AI] Analyzing screenshot with Gemini...');

    const imageData = fs.readFileSync(screenshotPath);
    const base64Image = imageData.toString('base64');
    const mimeType = 'image/png';

    try {
      const data = await this.callAPI(base64Image, mimeType);

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const issues = JSON.parse(jsonMatch[0]);
        return issues;
      }

      return [];
    } catch (error) {
      console.error('[AI] Error:', error.message);
      return [];
    }
  }

  /**
   * Analyze a page by taking a screenshot and sending to AI
   */
  async analyzePage(page, url) {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const screenshotPath = path.join(tempDir, `screenshot-${Date.now()}.png`);

    console.log('[AI] Taking screenshot...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const issues = await this.analyzeScreenshot(screenshotPath);

    // Clean up
    fs.unlinkSync(screenshotPath);

    return issues.map((issue, index) => ({
      step: index + 1,
      status: 'friction_detected',
      issue: issue.issue,
      impact: issue.impact,
      suggestion: issue.suggestion,
    }));
  }
}

export default AIAnalyzer;
