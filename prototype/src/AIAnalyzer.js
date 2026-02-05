import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Robust .env resolution: Try local cwd, then the prototype root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class AIAnalyzer {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Encodes an image to base64
   * @param {Buffer} buffer 
   */
  encodeImage(buffer) {
    return buffer.toString('base64');
  }

  /**
   * Analyze visual friction using GPT-4o-mini
   * @param {Buffer} screenshot 
   * @param {Object} context 
   */
  async analyzeFriction(screenshot, context) {
    const base64Image = this.encodeImage(screenshot);
    const persona = context.persona || 'Default';

    const personaInstructions = {
      'The Perfectionist': 'You are OBSESSED with visual polish, alignment, and consistency. Look for tiny spacing errors, inconsistent font weights, or micro-interactions that feel "cheap".',
      'The First-Timer': 'You are confused and easily overwhelmed. Look for jargon, unclear navigation, "blank" states, or any place where a user might ask "What do I do now?".',
      'The Power User': 'You want speed and efficiency. Look for slow animations, redundant confirmation dialogs, or lack of keyboard shortcuts that hinder a professional workflow.',
      'Default': 'You are a balanced user looking for general friction points.'
    };

    const behaviorPrompt = personaInstructions[persona] || personaInstructions['Default'];

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert UX Auditor and Product Experience Intelligence agent simulating the persona: "${persona}".
            ${behaviorPrompt}
            
            Your goal is to "experience" the product through this specific lens and identify friction points.
            
            Friction points include:
            - Confusing terminology or labels.
            - Visual hierarchy issues (e.g., hard to find primary action).
            - Annoying overlays or popups.
            - Bad contrast or accessibility issues.
            - "Cognitive Load" (too many choices).
            - Misleading UI patterns.

            Return your findings strictly in the following JSON format:
            {
              "issues": [
                {
                  "issue": "Description of the issue",
                  "impact": "How it affects the user (frustration, drop-off, confusion)",
                  "suggestion": "How to fix it",
                  "coordinates": { "x": 100, "y": 200, "width": 50, "height": 30 } // estimate coordinates if possible, else null
                }
              ]
            }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze the provided screenshot of the page: ${context.url}. 
                Context metadata: ${JSON.stringify(context.metadata)}.
                Identify the top 3-5 friction points. For each, provide the estimated pixel coordinates (center point width/height) of where the issue is visually located on the 1280x800 screenshot.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.issues || [];
    } catch (error) {
      console.error('[Sentio AI] Error during analysis:', error.message);
      return [];
    }
  }

  /**
   * Use AI to identify the most likely "Next Step" for a first-time user
   * @param {Buffer} screenshot 
   * @param {Object} context 
   */
  async identifyPrimaryAction(screenshot, context) {
    const base64Image = this.encodeImage(screenshot);
    const persona = context.persona || 'Default';

    const personaBehaviors = {
      'The Perfectionist': 'You prioritize elements that are perfectly aligned and clearly labeled. You avoid anything that looks like "clutter".',
      'The First-Timer': 'You are looking for the most obvious, high-contrast button that promises guidance or progress. You are wary of advanced or technical options.',
      'The Power User': 'You seek the fastest route to the goal. You look for "Quick" actions, keyboard-friendly paths, or bypassing redundant steps.',
      'Default': 'You are a standard user looking for the logical next step.'
    };

    const behavior = personaBehaviors[persona] || personaBehaviors['Default'];

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a real user simulating the persona: "${persona}".
            ${behavior}
            
            Identify the single most important action (button/link) you would click to advance your journey toward the goal.
            
            Return ONLY a JSON object:
            {
              "actionName": "Name of the button",
              "reason": "Why a user would click this to reach the goal",
              "selector_hint": "Text on the button or its role",
              "coordinates": { "x": 400, "y": 300 }, // Center point on a 1280x800 screen
              "confidence": 0.95
            }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Current goal: ${context.goal}. Page: ${context.url}. Viewport: 1280x800. 
                What is the single most important action to take to get closer to the goal?`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('[Sentio AI] Error identifying primary action:', error.message);
      return null;
    }
  }
  /**
   * Use AI to check if the user's goal has been accomplished
   * @param {Buffer} screenshot 
   * @param {Object} context 
   */
  async checkGoalCompletion(screenshot, context) {
    const base64Image = this.encodeImage(screenshot);

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Determine if the user's goal has been reached based on the screenshot.
            
            Return ONLY a JSON object:
            {
              "completed": true/false,
              "reason": "Why you think it's completed or not"
            }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Target goal: ${context.goal}. Current URL: ${context.url}. Is the goal reached?`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('[Sentio AI] Error checking goal completion:', error.message);
      return { completed: false, reason: 'Error in analysis' };
    }
  }
}
