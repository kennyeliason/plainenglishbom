# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plain English Book of Mormon - A Next.js app that presents the Book of Mormon with archaic King James English converted to modern language. Text is sourced from Project Gutenberg and transformed using rule-based regex patterns or OpenAI's GPT-4.1.

## Common Commands

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint
npm run parse            # Download and parse Book of Mormon from Project Gutenberg
npm run transform        # Transform verses using AI (default mode)
npm run transform:rules  # Transform using rule-based method only
npm run transform:ai     # Transform using AI method only
npm run transform -- ai --regenerate-book "1 Nephi"     # Regenerate specific book
npm run transform -- ai --regenerate-chapter "1 Nephi" 1  # Regenerate specific chapter
```

## Architecture

### Data Flow
1. **Parse**: `scripts/parse-gutenberg.ts` downloads text from Project Gutenberg → `data/original/parsed.json`
2. **Transform**: `scripts/transform-text.ts` applies transformations → `data/transformed/parsed.json`
3. **Serve**: Next.js reads from `data/transformed/parsed.json` via `src/lib/data.ts`

### Data Structure
```typescript
// src/lib/types.ts
BookOfMormon { books: Book[] }
Book { name, shortName, chapters: Chapter[] }
Chapter { number, verses: Verse[] }
Verse { number, text, plainText? }
```

The `plainText` field contains the modern English translation. If missing, the app falls back to displaying original `text`.

### Two Transformation Methods
- **Rule-based** (`src/lib/transform-rules.ts`): Fast regex patterns for pronouns (thee→you), verbs (hath→has), and archaic phrases
- **AI-powered** (`src/lib/ai-transform.ts`): Uses OpenAI GPT-4.1 for nuanced rewrites with context awareness

### URL Routing
- `/` - Home page with all books
- `/[book]` - Book page with chapter list (e.g., `/1-nephi`)
- `/[book]/[chapter]` - Chapter page with verses (e.g., `/1-nephi/1`)
- `/compare/[book]/[chapter]` - Model comparison page (if comparison data exists)

Book slugs: `1-nephi`, `2-nephi`, `jacob`, `enos`, `jarom`, `omni`, `words-of-mormon`, `mosiah`, `alma`, `helaman`, `3-nephi`, `4-nephi`, `mormon`, `ether`, `moroni`

### Key Files
- `src/lib/data.ts` - Data access layer with caching, slug helpers (`slugify`/`unslugify`)
- `src/lib/transform-rules.ts` - All regex transformation rules (pronouns, verbs, phrases)
- `src/lib/ai-transform.ts` - OpenAI integration with retry logic for rate limits
- `src/lib/seo.ts` - SEO metadata and schema.org structured data generation
- `src/lib/comparison.ts` - Loads model comparison data from `data/model-comparison/`

### Static Generation
All pages use `generateStaticParams()` to pre-render at build time. The chapter page iterates through all books and chapters to generate static routes.

## Environment Variables

For AI transformations, set `OPENAI_API_KEY` in `.env.local`. Rule-based transformations don't require any API key.
