import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are an expert at converting archaic/King James English into plain, modern English. Your task is to rewrite scripture verses to be clear and accessible while preserving their meaning and reverence.

Guidelines:
- Convert archaic pronouns (thee, thou, thy, ye) to modern equivalents (you, your)
- Convert archaic verbs (-eth, -est endings, hath, doth, art, wilt) to modern forms
- Simplify complex sentence structures while keeping the meaning
- Remove repetitive phrases like "it came to pass" and "and behold"
- Keep proper nouns, names of people, places unchanged
- Maintain the spiritual tone and meaning
- Do NOT add interpretation or commentary
- Do NOT change doctrinal content
- Output ONLY the rewritten text, no explanations

Example input:
"And it came to pass that the Lord spake unto my father, yea, even in a dream, and said unto him: Blessed art thou Lehi, because of the things which thou hast done"

Example output:
"The Lord spoke to my father in a dream and said to him: Blessed are you, Lehi, because of the things you have done"`;

export interface AITransformResult {
  original: string;
  transformed: string;
  cached: boolean;
}

export async function aiTransformVerse(verse: string): Promise<AITransformResult> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Rewrite this verse in plain, modern English:\n\n"${verse}"`,
      },
    ],
  });

  const content = message.content[0];
  const transformed =
    content?.type === "text" ? content.text.replace(/^["']|["']$/g, "").trim() : verse;

  return {
    original: verse,
    transformed,
    cached: false,
  };
}

export async function aiTransformChapter(
  verses: { number: number; text: string }[]
): Promise<{ number: number; text: string; plainText: string }[]> {
  const results: { number: number; text: string; plainText: string }[] = [];

  for (const verse of verses) {
    try {
      const result = await aiTransformVerse(verse.text);
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
  verses: { number: number; text: string }[]
): Promise<{ number: number; text: string; plainText: string }[]> {
  const versesText = verses.map((v) => `[${v.number}] ${v.text}`).join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system:
      SYSTEM_PROMPT +
      `\n\nYou will receive multiple verses, each prefixed with [number]. Output each transformed verse on its own line, prefixed with the same [number].`,
    messages: [
      {
        role: "user",
        content: `Rewrite these verses in plain, modern English:\n\n${versesText}`,
      },
    ],
  });

  const content = message.content[0];
  const responseText = content?.type === "text" ? content.text : "";

  // Parse the response
  const results: { number: number; text: string; plainText: string }[] = [];
  const lines = responseText.split("\n").filter((line) => line.trim());

  for (const verse of verses) {
    const pattern = new RegExp(`\\[${verse.number}\\]\\s*(.+)`, "i");
    const match = lines.find((line) => pattern.test(line));

    if (match) {
      const transformed = match.replace(pattern, "$1").trim();
      results.push({
        number: verse.number,
        text: verse.text,
        plainText: transformed,
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
}
