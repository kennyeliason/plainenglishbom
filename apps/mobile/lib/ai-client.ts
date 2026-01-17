import * as SecureStore from "expo-secure-store";
import type { Chapter, Verse } from "@plainenglishbom/core";

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

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// Call OpenAI API directly using fetch (avoids SDK bundler issues)
async function callOpenAI(messages: ChatMessage[], maxTokens: number = 500): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("No API key configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty response from API");
  }

  return content;
}

// Generate initial verse insight (1 sentence)
export async function generateVerseInsight(
  bookName: string,
  chapterNum: number,
  verse: Verse,
  chapter: Chapter
): Promise<string> {
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

  return callOpenAI([
    { role: "system", content: systemPrompt },
    { role: "user", content: "What's the key insight for this verse?" },
  ], 100);
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
  const systemPrompt = `You are a study companion for the Book of Mormon, helping users understand scripture.

The user is studying ${bookName} ${chapterNum}:${verse.number}.

THE VERSE: "${verse.plainText || verse.text}"
${chapter.summary ? `CHAPTER CONTEXT: ${chapter.summary}` : ""}

GUIDELINES:
- Help the user understand and appreciate the scriptures
- Stay positive and faith-promoting in your responses
- Discuss scriptural themes including trials, faith, repentance, and God's love
- You may reference teachings from modern prophets and apostles when relevant
- If asked about topics unrelated to scripture or faith, kindly redirect to the verse being studied
- Keep responses concise and uplifting (2-3 sentences unless more detail is needed)`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messageHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  return callOpenAI(messages, 500);
}

// Chat about a chapter (not a specific verse)
export async function chatAboutChapter(
  bookName: string,
  chapterNum: number,
  chapter: Chapter,
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string
): Promise<string> {
  // Include first few verses as context
  const previewVerses = chapter.verses.slice(0, 5);
  const versesPreview = previewVerses
    .map((v) => `${v.number}. ${v.plainText || v.text}`)
    .join("\n");

  const systemPrompt = `You are a study companion for the Book of Mormon, helping users understand scripture.

The user is studying ${bookName} Chapter ${chapterNum}.

${chapter.summary ? `CHAPTER SUMMARY: ${chapter.summary}` : ""}

CHAPTER PREVIEW (first few verses):
${versesPreview}

GUIDELINES:
- Help the user understand and appreciate this chapter of scripture
- Stay positive and faith-promoting in your responses
- Discuss scriptural themes including trials, faith, repentance, and God's love
- You may reference teachings from modern prophets and apostles when relevant
- If asked about topics unrelated to scripture or faith, kindly redirect to the chapter being studied
- Keep responses concise and uplifting (2-3 sentences unless more detail is needed)`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messageHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  return callOpenAI(messages, 500);
}
