// OpenAI Client Wrapper
import OpenAI from 'openai';

// Lazy initialization of OpenAI client
let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Configuration
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.3');
const DEFAULT_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10);
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Delay utility for retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call OpenAI GPT with error handling and retry logic
 * @param messages - Array of chat messages
 * @param options - Optional configuration overrides
 * @returns Assistant's response content
 */
export async function callGPT(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string> {
  const model = options?.model || DEFAULT_MODEL;
  const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
  const max_tokens = options?.max_tokens || DEFAULT_MAX_TOKENS;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return content;
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error?.status >= 400 && error?.status < 500) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }

      // Retry on server errors (5xx) or network errors
      if (attempt < MAX_RETRIES) {
        console.warn(`OpenAI call failed (attempt ${attempt}/${MAX_RETRIES}), retrying...`, error.message);
        await delay(RETRY_DELAY * attempt); // Exponential backoff
      }
    }
  }

  // All retries exhausted
  throw new Error(`OpenAI API failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

/**
 * Simple single prompt call with system message
 * @param prompt - User prompt
 * @param systemPrompt - System instructions
 * @returns Assistant's response
 */
export async function callGPTSimple(prompt: string, systemPrompt: string): Promise<string> {
  return callGPT([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ]);
}
