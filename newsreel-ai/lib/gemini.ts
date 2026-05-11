// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadPromptConfig } from './prompts';
import { GenerateNewsResponse } from './types';

const MAX_OUTPUT_TOKENS = 4096;
const MAX_RETRIES = 1;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Validates a user-supplied topic before sending it through the full
 * script-generation pipeline. Returns quickly (<1 s target).
 */
export async function validateTopic(topic: string): Promise<{
  is_valid: boolean;
  is_safe: boolean;
  source_availability: string;
  reasoning: string;
}> {
  const config = await loadPromptConfig('topic_validation', topic);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const response = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: config.system + '\n\n' + config.user }],
      },
    ],
    generationConfig: {
      temperature: 0.1, // Very deterministic for validation
      maxOutputTokens: 500,
    },
  });

  const responseText = response.response.text();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    // If we can't parse, assume valid and let the main pipeline decide
    return {
      is_valid: true,
      is_safe: true,
      source_availability: 'medium',
      reasoning: 'Unable to validate, proceeding',
    };
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Main entry-point: validates the topic, then calls Gemini to produce
 * a video-ready news script with cited sources.
 */
export async function generateDualScriptAndSources(
  topic: string,
): Promise<GenerateNewsResponse> {
  // Step 1 — quick validation
  const validation = await validateTopic(topic);
  if (!validation.is_valid || !validation.is_safe) {
    throw new Error(`Invalid topic: ${validation.reasoning}`);
  }

  // Step 2 — load file-based prompts
  const config = await loadPromptConfig('dual_script_generation', topic);

  // Step 3 — call Gemini with retry
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Gemini] Retry attempt ${attempt}…`);
      }

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: config.system },
              { text: '\n\n---\n\n' },
              { text: config.user },
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature, // 0.3
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          topP: 0.8,
          topK: 40,
        },
      });

      const responseText = response.response.text();

      // Step 4 — extract JSON (Gemini sometimes wraps in markdown)
      let jsonText = responseText;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      // Attempt to repair truncated JSON before parsing
      jsonText = repairJson(jsonText);

      const parsed = JSON.parse(jsonText) as GenerateNewsResponse;

      // Step 5 — basic output validation
      if (!parsed.script_visual || !parsed.script_readable || !parsed.sources || parsed.sources.length < 2) {
        throw new Error('Invalid response structure from Gemini');
      }

      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Gemini generation error (attempt ${attempt}):`, lastError.message);
    }
  }

  throw lastError!;
}

/**
 * Attempt to repair truncated JSON by closing open strings, arrays, objects.
 */
function repairJson(text: string): string {
  let repaired = text.trim();

  // Count unmatched braces/brackets
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escaped = false;

  for (const ch of repaired) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }

  // Close an unterminated string
  if (inString) repaired += '"';

  // Close open brackets and braces
  while (brackets > 0) { repaired += ']'; brackets--; }
  while (braces > 0)   { repaired += '}'; braces--; }

  return repaired;
}
