# Plain English Book of Mormon

A Next.js web application that presents the Book of Mormon with its archaic King James English carefully converted to plain, modern language. The text is sourced from Project Gutenberg and transformed using rule-based and AI-powered translation methods.

## Features

- **Modern Translation**: Converts archaic phrases like "it came to pass" and pronouns like "thee", "thou", and "ye" to their modern equivalents
- **Dual Display**: Shows both the original text and plain English translation side-by-side
- **Beautiful UI**: Clean, elegant design with dark/light theme toggle
- **Full Navigation**: Browse by book, chapter, and verse with intuitive navigation
- **Static Generation**: All pages are pre-rendered for optimal performance

## Project Structure

```text
plainenglishbom/
├── data/
│   ├── original/          # Raw and parsed text from Project Gutenberg
│   │   ├── raw.txt        # Raw text downloaded from Project Gutenberg
│   │   └── parsed.json    # Structured JSON with books, chapters, and verses
│   └── transformed/       # Verses with plain English translations
│       └── parsed.json    # Same structure as original, with plainText added to verses
├── scripts/
│   ├── parse-gutenberg.ts  # Downloads and parses Book of Mormon text
│   ├── transform-text.ts   # Transforms verses to plain English
│   └── test-transform.ts   # Test script for transformation rules
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/         # React components (ThemeToggle, StructuredData, etc.)
│   └── lib/                # Data access, transformation rules, AI integration
└── public/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- OpenAI API key (optional, for AI-powered transformations)

### Installation

1. Clone the repository
1. Install dependencies:

```bash
npm install
```

1. Set up environment variables (for AI transformations)

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
```

**Note**: The AI transformation feature uses OpenAI's API (not Anthropic). You can skip this step if you only want to use rule-based transformations. The `.env.local` file is automatically loaded by the transformation scripts.

### Data Setup

Before running the application, you need to parse and transform the Book of Mormon text:

#### Step 1: Parse the Original Text

Download and parse the Book of Mormon text from Project Gutenberg:

```bash
npm run parse
```

This script:

- Downloads the raw text from Project Gutenberg
- Saves it to `data/original/raw.txt`
- Parses it into structured JSON with books, chapters, and verses
- Saves the parsed data to `data/original/parsed.json`

#### Step 2: Transform the Text to Plain English

Transform the parsed text using one of three methods:

**Option A: Rule-Based Only** (fast, no API key needed)

```bash
npm run transform:rules
```

This uses regex patterns to convert archaic language. It's fast and doesn't require an API key, but may not handle complex sentence structures as well.

**Option B: AI-Powered** (requires OpenAI API key, slower but more nuanced)

```bash
npm run transform:ai
```

This uses OpenAI's GPT-4.1 to intelligently rewrite verses while preserving meaning and spiritual tone. GPT-4.1 is the most consistent and safest model for this project.

**Option C: Combined** (rules first, then AI for complex passages)

```bash
npm run transform combined
```

This applies rule-based transformations first, then uses AI only for longer or more complex verses (over 100 characters or containing semicolons). This balances speed and quality.

**Default Behavior**: Running `npm run transform` without arguments defaults to **AI mode** (not rule-based).

The transformed data is saved to `data/transformed/parsed.json`. The script automatically:

- Resumes from where it left off if interrupted
- Saves progress after each book
- Shows real-time progress with processing speed and estimated time remaining

### Advanced Transformation Options

#### Regenerate All Verses

To regenerate all verses (useful after updating transformation rules):

```bash
npm run transform:regenerate
```

Or with a specific mode:

```bash
npm run transform -- ai --regenerate
npm run transform -- rules --regenerate
npm run transform -- combined --regenerate
```

#### Regenerate a Specific Book

To regenerate only a specific book:

```bash
npm run transform -- ai --regenerate-book "1 Nephi"
```

#### Regenerate a Specific Chapter

To regenerate only a specific chapter:

```bash
npm run transform -- ai --regenerate-chapter "1 Nephi" 1
```

**Note**: The `--` is required to separate npm arguments from script arguments. Without it, npm will try to parse the flags as npm options.

#### Filter to a Specific Book

To transform only one book (useful for testing):

```bash
npm run transform -- ai "1 Nephi"
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run parse` - Download and parse Book of Mormon from Project Gutenberg
- `npm run transform` - Transform verses using AI method (default)
- `npm run transform rules` - Transform using rule-based method only
- `npm run transform ai` - Transform using AI method only
- `npm run transform combined` - Transform using combined method (rules + AI)
- `npm run transform:rules` - Alias for `npm run transform rules`
- `npm run transform:ai` - Alias for `npm run transform ai`
- `npm run transform:regenerate` - Regenerate all verses using default mode

## Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Fonts**: Cormorant Garamond, Source Serif 4 (via Google Fonts)
- **AI**: OpenAI GPT-4.1 (for advanced transformations - most consistent and safest model)
- **Data Source**: [Project Gutenberg](https://www.gutenberg.org/ebooks/17)

## Transformation Methods

### Rule-Based Transformation

Uses regex patterns to convert:

- **Archaic pronouns**: thee → you, thou → you, thy → your, ye → you
- **Archaic verbs**: hath → has, doth → does, -eth → -s, art → are, wilt → will
- **Archaic phrases**: "it came to pass" → removed, "wherefore" → "therefore"
- **Archaic words**: behold → see, verily → truly, unto → to, etc.

The rule-based transformation is fast and doesn't require an API key, but it performs literal replacements and may not handle complex sentence structures or context as well as AI.

See `src/lib/transform-rules.ts` for the complete rule set.

### AI-Powered Transformation

Uses OpenAI's GPT-4.1 API to intelligently rewrite verses while preserving meaning and spiritual tone. GPT-4.1 is the most consistent and safest model for this project. The AI:

- Understands context and rewrites naturally (not word-for-word)
- Handles complex sentence structures better
- Maintains reverence and spiritual tone
- Preserves all doctrinal content and meaning
- Keeps proper nouns (names, places) unchanged

The AI transformation includes:

- Context awareness (uses previous and next verses for better understanding)
- Retry logic with exponential backoff for rate limits
- Post-processing to clean up the output

See `src/lib/ai-transform.ts` for implementation details.

### Combined Method

Applies rule-based transformations first, then uses AI only for:

- Verses longer than 100 characters
- Verses containing semicolons (indicating complex structure)

This balances speed and quality, reducing API calls while still getting AI help for complex passages.

## Data Format

The parsed data follows this structure:

```typescript
{
  books: [
    {
      name: "THE FIRST BOOK OF NEPHI", // Full canonical name
      shortName: "1 Nephi", // Short name used in URLs
      chapters: [
        {
          number: 1,
          verses: [
            {
              number: 1,
              text: "Original archaic text...", // Original verse text
              plainText: "Transformed plain English text...", // Optional: plain English version
            },
          ],
        },
      ],
    },
  ];
}
```

The `plainText` field is added during transformation. If a verse doesn't have `plainText`, the app will display the original `text` instead.

## Workflow

1. **Parse**: Run `npm run parse` to download and parse the original text
2. **Transform**: Run `npm run transform` (with your preferred mode) to create plain English versions
3. **Develop**: Run `npm run dev` to view the application
4. **Iterate**: Use regenerate options to update specific books or chapters as needed

## Troubleshooting

**Transformations are slow or timing out:**

- Use rule-based mode for faster processing: `npm run transform:rules`
- The AI mode includes automatic retry logic for rate limits
- Progress is saved after each book, so you can resume if interrupted

**Missing plainText in verses:**

- Make sure you've run the transform script
- Check that `data/transformed/parsed.json` exists
- The app will fall back to showing original text if `plainText` is missing

**API errors:**

- Verify your `OPENAI_API_KEY` is set in `.env.local`
- Check that you have API credits/quota available
- The script will fall back to original text on errors

## License

The Book of Mormon text is in the public domain (Project Gutenberg). The code and transformations are part of this project.

## Acknowledgments

- Source text from [Project Gutenberg](https://www.gutenberg.org/ebooks/17)
- Built with [Next.js](https://nextjs.org)
- AI transformations powered by [OpenAI](https://www.openai.com)
