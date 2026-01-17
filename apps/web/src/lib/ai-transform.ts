import OpenAI from "openai";
import { postProcessTranslation } from "./translation-helpers";

// ============================================================================
// AI TRANSLATION MODULE
// ============================================================================
// This module handles translating Book of Mormon verses from archaic English
// to modern, plain English using OpenAI's GPT-4.1 model.
//
// Key design decisions:
// - One verse at a time (prevents "verse bleed" where content mixes between verses)
// - Simple, focused prompt that emphasizes accuracy
// - Trust GPT-4.1 to do a good job - minimal validation
// ============================================================================

// The model to use for all translations - GPT-4.1 is reliable and cost-effective
const MODEL = "gpt-4.1";

// Lazy-load OpenAI client to ensure environment variables are loaded first
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// ============================================================================
// THE PROMPT - Keep this simple and effective
// ============================================================================
const SYSTEM_PROMPT = `You are translating verses from the Book of Mormon from archaic English to clear, modern American English.

RULES:
1. Translate ONLY the provided verse - do not add content from other verses
2. Remove archaic phrases like "it came to pass", "yea", "behold", "wherefore"
3. Update old verb forms: "hath" → "has", "spake" → "spoke", "doth" → "does"
4. Keep the same meaning - don't add or remove ideas
5. Preserve proper nouns and spiritual tone

Output ONLY the modernized verse text.`;

// ============================================================================
// TYPES
// ============================================================================

export interface AITransformResult {
  original: string;
  transformed: string;
  cached: boolean;
}

interface TransformOptions {
  bookName?: string;
  chapterNumber?: number;
  verseNumber?: number;
  model?: string; // Optional model override (defaults to gpt-4.1)
}

// ============================================================================
// RETRY HELPER - Handles rate limits with exponential backoff
// ============================================================================

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRateLimit =
        error instanceof Error &&
        (error.message.includes("rate limit") ||
          error.message.includes("429") ||
          (error as { status?: number }).status === 429);

      if (isLastAttempt || !isRateLimit) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(
        `Rate limit hit, retrying in ${delay}ms... (attempt ${
          attempt + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

// ============================================================================
// MAIN TRANSLATION FUNCTION - Translates one verse at a time
// ============================================================================

export async function aiTransformVerse(
  verse: string,
  options: TransformOptions = {}
): Promise<AITransformResult> {
  const { bookName, chapterNumber, verseNumber, model = MODEL } = options;

  // Build the user message with context about which verse this is
  let userMessage = "";
  if (bookName && chapterNumber !== undefined && verseNumber !== undefined) {
    userMessage += `${bookName} ${chapterNumber}:${verseNumber}\n\n`;
  }
  userMessage += `"${verse}"`;

  // Make the API call with retry logic for rate limits
  const response = await retryWithBackoff(async () => {
    return await getOpenAIClient().chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1024,
      temperature: 0.5,
    });
  });

  // Clean up the response (remove surrounding quotes, fix whitespace/punctuation)
  const rawOutput = response.choices[0]?.message?.content || verse;
  const cleaned = postProcessTranslation(
    rawOutput.replace(/^["']|["']$/g, "").trim()
  );

  return {
    original: verse,
    transformed: cleaned,
    cached: false,
  };
}
