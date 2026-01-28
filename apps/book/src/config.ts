/**
 * Book generation configuration
 * Specs aligned with Amazon KDP requirements
 */

// CalVer version - update this when generating new editions
export const VERSION = "2026.01";

export const BOOK_CONFIG = {
  title: "The Plain English Book of Mormon",
  subtitle: "A Modern Translation",
  projectName: "The Plain English Book of Mormon Project",
  website: "plainenglishbom.com",

  // For print edition
  print: {
    // 6" x 9" is a popular trade paperback size for KDP
    trimWidth: 6, // inches
    trimHeight: 9, // inches

    // Margins (KDP minimums vary by page count, these are safe)
    marginTop: 0.75, // inches
    marginBottom: 0.75,
    marginInner: 0.875, // gutter - needs more space for binding
    marginOuter: 0.5,

    // Typography
    fontSize: 10, // points - slightly smaller for scripture feel
    lineHeight: 1.35,
    chapterTitleSize: 18,
    bookTitleSize: 28,

    // Custom fonts (matching website)
    fonts: {
      title: "fonts/CormorantGaramond-Regular.ttf", // For book/chapter titles
      body: "fonts/SourceSerif4-Regular.ttf", // For verse text
      bold: "fonts/SourceSerif4-Bold.ttf", // For verse numbers
    },
  },

  // For ebook edition
  epub: {
    language: "en",
    publisher: "The Plain English Book of Mormon Project",
    rights: "Public Domain Translation",
  },

  // Front matter content
  frontMatter: {
    dedication: "",
    introduction: `This translation aims to make the Book of Mormon accessible to modern readers by converting archaic King James English into clear, contemporary language.

The original text uses language patterns from 1611—"thee," "thou," "hath," "wherefore," and complex sentence structures that can be barriers to understanding. This translation preserves the meaning and message while making it easier to read and comprehend.

This is not a replacement for the original text. It's a reading aid. Verse numbers are preserved so you can easily reference the original at any time.

This translation was created as an open source project. If you find errors or have suggestions for improvement, contributions are welcome at github.com/kennyeliason/plainenglishbom.`,

    aboutTranslation: `**How This Translation Was Made**

This translation uses a combination of rule-based text transformations and AI-assisted modernization:

1. **Pronoun updates**: "thee," "thou," "thy," "ye" → "you," "your"
2. **Verb modernization**: "hath" → "has," "doth" → "does," "saith" → "says"
3. **Phrase simplification**: "it came to pass" → contextual alternatives, "wherefore" → "therefore" or "so"
4. **Sentence clarity**: Complex archaic constructions rewritten for modern comprehension

The goal is accessibility, not interpretation. Doctrinal meaning is preserved; only the language is updated.`,
  },
};

/**
 * Get the current CalVer version string
 */
export function getVersion(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

/**
 * Get output filename with version
 */
export function getOutputFilename(format: "pdf" | "epub"): string {
  const version = getVersion();
  return `plain-english-book-of-mormon-${version}.${format}`;
}
