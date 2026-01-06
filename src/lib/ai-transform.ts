import OpenAI from "openai";
import { postProcessTranslation } from "./translation-helpers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are translating scripture from archaic King James English into natural, modern English. Your task is to rewrite verses to be clear and accessible while preserving their meaning and reverence.

CRITICAL INSTRUCTIONS:
- Do NOT do word-for-word replacement - understand the meaning and rewrite naturally
- Think like a native English speaker - how would you say this today?
- Rewrite sentences for natural flow, not literal translation

COMMON ISSUES TO FIX:
- "yea" was used as an intensifier/connector, NOT as "yes" - remove it entirely or use "indeed" very sparingly only when emphasis is truly needed
- "it came to pass" is a filler phrase - remove it entirely
- "and behold" is archaic emphasis - remove or replace with natural transitions
- Archaic pronouns (thee, thou, thy, ye) → modern equivalents (you, your)
- Archaic verbs (-eth, -est endings, hath, doth, art, wilt) → modern forms
- Break up long, complex sentences into clearer modern sentences
- Use active voice when possible
- Remove redundant phrases that don't add meaning

EXAMPLES OF NATURAL VS LITERAL TRANSLATION:
Bad (literal): "And it came to pass that the Lord spake unto my father, yea, even in a dream, and said unto him: Blessed art thou Lehi"
Good (natural): "The Lord spoke to my father in a dream and said to him: Blessed are you, Lehi"

Bad (literal): "having been highly favored; yes, having had knowledge"
Good (natural): "having been highly favored and having had knowledge"

Bad (literal): "Yes, I make a record"
Good (natural): "I make a record"

MAINTAIN REVERENCE AND MEANING:
- This is sacred scripture - maintain the spiritual tone
- Preserve all doctrinal content and meaning
- Keep proper nouns (names, places) unchanged
- Do NOT add interpretation or commentary
- Output ONLY the rewritten text, no explanations`;

export interface AITransformResult {
  original: string;
  transformed: string;
  cached: boolean;
}

interface TransformOptions {
  bookName?: string;
  chapterNumber?: number;
  verseNumber?: number;
  previousVerse?: string;
  nextVerse?: string;
}

/**
 * Retry mechanism with exponential backoff for rate limits
 */
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
      console.warn(`Rate limit hit, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function aiTransformVerse(
  verse: string,
  options: TransformOptions = {}
): Promise<AITransformResult> {
  const { bookName, chapterNumber, verseNumber, previousVerse, nextVerse } = options;

  // Build context-aware user message
  let userMessage = "";
  
  if (bookName && chapterNumber !== undefined && verseNumber !== undefined) {
    userMessage += `Here is verse ${verseNumber} of ${bookName} Chapter ${chapterNumber}:\n\n`;
  } else {
    userMessage += "Here is a verse to translate:\n\n";
  }

  if (previousVerse) {
    userMessage += `Previous verse: ${previousVerse}\n\n`;
  }

  userMessage += `"${verse}"`;

  if (nextVerse) {
    userMessage += `\n\nNext verse: ${nextVerse}`;
  }

  userMessage += "\n\nTranslate this verse naturally into modern English:";

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using gpt-4o-mini as gpt-5-mini may not be available yet
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 1024,
        temperature: 0.3, // Lower temperature for more consistent, faithful translations
      });
    });

    const transformed =
      response.choices[0]?.message?.content?.replace(/^["']|["']$/g, "").trim() || verse;

    // Apply light post-processing
    const cleaned = postProcessTranslation(transformed);

    return {
      original: verse,
      transformed: cleaned,
      cached: false,
    };
  } catch (error) {
    console.error("Error transforming verse:", error);
    // Fall back to original text on error
    return {
      original: verse,
      transformed: verse,
      cached: false,
    };
  }
}

export async function aiTransformChapter(
  verses: { number: number; text: string }[],
  options: { bookName?: string; chapterNumber?: number } = {}
): Promise<{ number: number; text: string; plainText: string }[]> {
  const results: { number: number; text: string; plainText: string }[] = [];

  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i];
    const previousVerse = i > 0 ? verses[i - 1].text : undefined;
    const nextVerse = i < verses.length - 1 ? verses[i + 1].text : undefined;

    try {
      const result = await aiTransformVerse(verse.text, {
        bookName: options.bookName,
        chapterNumber: options.chapterNumber,
        verseNumber: verse.number,
        previousVerse,
        nextVerse,
      });
      results.push({
        number: verse.number,
        text: verse.text,
        plainText: result.transformed,
      });
    } catch (error) {
      console.error(`Error transforming verse ${verse.number}:`, error);
      // Fall back to original text on error
      results.push({
        number: verse.number,
        text: verse.text,
        plainText: verse.text,
      });
    }
  }

  return results;
}

// Batch transform multiple verses in a single API call for efficiency
export async function aiTransformVersesBatch(
  verses: { number: number; text: string }[],
  options: { bookName?: string; chapterNumber?: number } = {}
): Promise<{ number: number; text: string; plainText: string }[]> {
  const versesText = verses
    .map((v) => `[${v.number}] ${v.text}`)
    .join("\n\n");

  let userMessage = "";
  if (options.bookName && options.chapterNumber !== undefined) {
    userMessage += `Here are verses from ${options.bookName} Chapter ${options.chapterNumber}:\n\n`;
  } else {
    userMessage += "Here are verses to translate:\n\n";
  }
  userMessage += versesText;
  userMessage += "\n\nTranslate each verse naturally into modern English. Output each transformed verse on its own line, prefixed with the same [number].";

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT + "\n\nYou will receive multiple verses, each prefixed with [number]. Output each transformed verse on its own line, prefixed with the same [number].",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      });
    });

    const responseText = response.choices[0]?.message?.content || "";
    const lines = responseText.split("\n").filter((line) => line.trim());

    // Parse the response
    const results: { number: number; text: string; plainText: string }[] = [];

    for (const verse of verses) {
      const pattern = new RegExp(`\\[${verse.number}\\]\\s*(.+)`, "i");
      const match = lines.find((line) => pattern.test(line));

      if (match) {
        const transformed = match.replace(pattern, "$1").trim();
        const cleaned = postProcessTranslation(transformed);
        results.push({
          number: verse.number,
          text: verse.text,
          plainText: cleaned,
        });
      } else {
        // Fall back to original if parsing fails
        results.push({
          number: verse.number,
          text: verse.text,
          plainText: verse.text,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in batch transformation:", error);
    // Fall back to individual transformations
    return aiTransformChapter(verses, options);
  }
}
