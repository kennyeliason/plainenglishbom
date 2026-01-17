import * as SecureStore from "expo-secure-store";
import type { Chapter, Verse } from "@plainenglishbom/core";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const API_KEY_STORAGE_KEY = "openai_api_key";

// Store API key securely
export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
}

// Get stored API key
export async function getApiKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

// Remove API key
export async function removeApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

// Check if API key exists
export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return !!key;
}

// Dynamically import OpenAI to avoid circular dependency issues with Metro bundler
type OpenAIClient = InstanceType<typeof import("openai").default>;

// Create OpenAI client with stored key
async function getOpenAIClient(): Promise<OpenAIClient | null> {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  // Dynamic import to avoid bundler issues
  const { default: OpenAI } = await import("openai");
  return new OpenAI({ apiKey });
}

// Generate initial verse insight (1 sentence)
export async function generateVerseInsight(
  bookName: string,
  chapterNum: number,
  verse: Verse,
  chapter: Chapter
): Promise<string> {
  const client = await getOpenAIClient();
  if (!client) {
    throw new Error("No API key configured");
  }

  // Get surrounding verses for context (2 before, 2 after)
  const verseIndex = chapter.verses.findIndex((v) => v.number === verse.number);
  const startIdx = Math.max(0, verseIndex - 2);
  const endIdx = Math.min(chapter.verses.length, verseIndex + 3);
  const surroundingVerses = chapter.verses.slice(startIdx, endIdx);

  const systemPrompt = `You are a study companion for the Book of Mormon.
The user tapped for insight on ${bookName} ${chapterNum}:${verse.number}.

THE VERSE:
"${verse.plainText || verse.text}"

SURROUNDING CONTEXT:
${surroundingVerses.map((v) => `${v.number}. ${v.plainText || v.text}`).join("\n")}

${chapter.summary ? `CHAPTER SUMMARY: ${chapter.summary}` : ""}

Give ONE sentence that captures the key insight about this verse.
Be clear, conversational, and age-appropriate.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "What's the key insight for this verse?" },
    ],
    max_tokens: 100,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || "Unable to generate insight.";
}

// Chat about a verse with follow-up questions
export async function chatAboutVerse(
  bookName: string,
  chapterNum: number,
  verse: Verse,
  chapter: Chapter,
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string
): Promise<string> {
  const client = await getOpenAIClient();
  if (!client) {
    throw new Error("No API key configured");
  }

  const systemPrompt = `You are a study companion for the Book of Mormon, focused ONLY on helping users understand scripture.

The user is studying ${bookName} ${chapterNum}:${verse.number}.

THE VERSE: "${verse.plainText || verse.text}"
${chapter.summary ? `CHAPTER CONTEXT: ${chapter.summary}` : ""}

STRICT GUIDELINES:
- ONLY answer questions about this verse, the Book of Mormon, or related scripture topics
- If asked about unrelated topics (math, coding, recipes, etc.), politely redirect: "I'm here to help with scripture study. What would you like to know about this verse?"
- Be helpful, accurate, and family-friendly
- Reference specific verses when relevant
- Keep responses concise (2-3 sentences unless more detail is needed)
- Never generate inappropriate, violent, or off-topic content`;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messageHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || "Unable to generate response.";
}
