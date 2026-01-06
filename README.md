# Plain English Book of Mormon

A Next.js web application that presents the Book of Mormon with its archaic King James English carefully converted to plain, modern language. The text is sourced from Project Gutenberg and transformed using rule-based and AI-powered translation methods.

## Features

- **Modern Translation**: Converts archaic phrases like "it came to pass" and pronouns like "thee", "thou", and "ye" to their modern equivalents
- **Dual Display**: Shows both the original text and plain English translation side-by-side
- **Beautiful UI**: Clean, elegant design with dark/light theme toggle
- **Full Navigation**: Browse by book, chapter, and verse with intuitive navigation
- **Static Generation**: All pages are pre-rendered for optimal performance

## Project Structure

```
plainenglishbom/
├── data/
│   ├── original/          # Raw and parsed text from Project Gutenberg
│   └── transformed/       # Verses with plain English translations
├── scripts/
│   ├── parse-gutenberg.ts  # Downloads and parses Book of Mormon text
│   └── transform-text.ts   # Transforms verses to plain English
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/         # React components (ThemeToggle, etc.)
│   └── lib/                # Data access, transformation rules, AI integration
└── public/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (for AI transformations):

Create a `.env.local` file with your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### Data Setup

Before running the application, you need to parse and transform the Book of Mormon text:

1. **Parse the original text** (downloads from Project Gutenberg and parses into structured JSON):

```bash
npm run parse
```

This creates `data/original/parsed.json` with all books, chapters, and verses.

2. **Transform the text** to plain English:

You can use three different transformation modes:

- **Rule-based only** (fast, no API needed):

```bash
npm run transform:rules
```

- **AI-powered** (requires Anthropic API key, slower but more nuanced):

```bash
npm run transform:ai
```

- **Combined** (rules first, then AI for complex passages):

```bash
npm run transform combined
```

Note: `npm run transform` without arguments defaults to rule-based transformation only.

The transformed data is saved to `data/transformed/parsed.json`.

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
- `npm run transform` - Transform verses using combined method (rules + AI)
- `npm run transform:rules` - Transform using rule-based method only
- `npm run transform:ai` - Transform using AI method only

## Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Fonts**: Cormorant Garamond, Source Serif 4 (via Google Fonts)
- **AI**: Anthropic Claude API (for advanced transformations)
- **Data Source**: Project Gutenberg (https://www.gutenberg.org/ebooks/17)

## Transformation Methods

### Rule-Based Transformation

Uses regex patterns to convert:

- Archaic pronouns (thee → you, thy → your, ye → you)
- Archaic verbs (hath → has, doth → does, -eth → -s)
- Archaic phrases ("it came to pass" → removed, "wherefore" → "therefore")
- Archaic words (behold → see, verily → truly, etc.)

See `src/lib/transform-rules.ts` for the complete rule set.

### AI-Powered Transformation

Uses Anthropic's Claude API to intelligently rewrite verses while preserving meaning and spiritual tone. Better at handling complex sentence structures and context.

## Data Format

The parsed data follows this structure:

```typescript
{
  books: [
    {
      name: "THE FIRST BOOK OF NEPHI",
      shortName: "1 Nephi",
      chapters: [
        {
          number: 1,
          verses: [
            {
              number: 1,
              text: "Original archaic text...",
              plainText: "Transformed plain English text...", // optional
            },
          ],
        },
      ],
    },
  ];
}
```

## License

The Book of Mormon text is in the public domain (Project Gutenberg). The code and transformations are part of this project.

## Acknowledgments

- Source text from [Project Gutenberg](https://www.gutenberg.org/ebooks/17)
- Built with [Next.js](https://nextjs.org)
- AI transformations powered by [Anthropic Claude](https://www.anthropic.com)
