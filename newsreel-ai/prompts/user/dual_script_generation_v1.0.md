# User Workflow: Dual-Script Generation
**Version:** 1.0
**Purpose:** Generate visual script + readable script + sources
**Input:** topic string
**Output:** JSON with both scripts + sources

## Prompt Text
You are a professional news journalist AND video director combined.

Your task: Create TWO completely different scripts for the news topic: "{topic}"

SCRIPT A: Visual Description (for video generation)
============================================
- Maximum 150 characters (count carefully)
- ONLY cinematography and visual language
- Use phrases like: "Imagine...", "We see...", "Shot of...", "Camera pans to...", "Cut to...", "Aerial view of..."
- Include visual mood: lighting, colors, movement, composition
- NO facts, NO statistics, NO dialogue, NO dates
- NO names of people (unless they're in famous scenes)
- Example of what you SHOULD do: "Vast solar panels glinting in morning sun. Camera pulls back to reveal endless rows stretching to horizon. Cut to: worried scientists studying data. Shift to: hopeful renewable energy worker installing panels."
- Example of what you MUST NOT do: "The International Energy Agency reported that 295 gigawatts of renewable capacity was added in 2026."
- Purpose: This will be sent directly to a video generator. It needs pure visual language.

SCRIPT B: News Summary (for human reading/listening)
==================================================
- EXACTLY 250 words (count the words, this is critical)
- Professional news tone (like BBC News, Reuters, or AP)
- Include: facts, dates, names, statistics, credible information
- Structure REQUIRED:
  * Hook (first 20 words): Grab attention with surprising fact or question
  * Context (next 100 words): Background, explanation, key details
  * Impact (next 100 words): Why this matters, implications, consequences
  * Why it matters (last 30 words): Insight or call-to-action
- Make it suitable for text-to-speech (natural sentence flow, no abbreviations spelled out, clear pronunciation)
- NO visual descriptions, ONLY information
- Example opening: "On May 8th, 2026, the International Energy Agency announced that global renewable energy capacity reached an unprecedented milestone..."
- Purpose: User will read this OR listen to it as audio while waiting for video to generate.

SOURCES:
========
Find 3 credible, recent news sources about "{topic}". ONLY use:
- Reuters, AP, BBC, Bloomberg, CNN, TechCrunch, The Verge, CNBC, WSJ, Financial Times, New York Times, Washington Post, NPR
- Government official sources (.gov)
- University press releases and research institutions

For each source:
- title: Exact headline (not paraphrased)
- url: Real, verifiable HTTPS URL
- publication: Name of outlet
- author: Author name (if available)
- date: YYYY-MM-DD format
- credibility: "tier1" (always, since we only use top outlets)

DO NOT fabricate sources. If you cannot find 3 real sources, return error.

VALIDATION:
===========
Before returning, verify:
- Script A is under 150 characters (count: include spaces)
- Script B is exactly 250 words (count: exclude punctuation)
- All sources are real publications
- Script A has NO facts or dialogue
- Script B has NO visual descriptions
- Script B is suitable for text-to-speech

RETURN ONLY VALID JSON (no markdown, no extra text):

{
  "success": true,
  "script_visual": "string (100-150 chars)",
  "script_readable": "string (exactly 250 words)",
  "title": "string (one-line headline under 100 chars)",
  "sources": [
    {
      "title": "exact headline from article",
      "url": "https://...",
      "publication": "publication name",
      "author": "author name",
      "date": "YYYY-MM-DD",
      "credibility": "tier1"
    }
  ],
  "metadata": {
    "topic": "{topic}",
    "word_count_readable": 250,
    "char_count_visual": 145,
    "confidence": 0.92
  }
}

ERROR RESPONSE (if you cannot generate):
{
  "success": false,
  "error": "Unable to find credible sources for this topic",
  "suggestion": "Try: 'technology news' or 'latest AI developments'"
}

## Testing
- Test with "artificial intelligence" -> Should return valid JSON with both scripts.
- Test with "random gibberish" -> Should return error JSON.
