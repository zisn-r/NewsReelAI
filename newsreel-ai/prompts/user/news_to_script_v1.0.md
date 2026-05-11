# User Workflow: News Topic to Video Script

**Version:** 1.0  
**Purpose:** Complete workflow to convert user topic into video-ready script  
**Input:** topic string (e.g., "AI regulation")  
**Output:** JSON with script, sources, metadata  
**Latency Target:** <3 seconds  
**Model:** Gemini 2.5 Flash  

---

## Complete Prompt (System + User)

### System Prompts (Combine all three):
1. `journalist_role_v1.0.md`
2. `video_script_optimization_v1.0.md`
3. `source_validation_v1.1.md`

### User Prompt Text:

```
Your task: Create a compelling 60-second video script about the following news topic.

TOPIC: "{topic}"

REQUIREMENTS:
1. Script must be 300-350 words (for 60-second video)
2. Use vivid, cinematic, visual language
3. Include specific dates, names, numbers (no vague statements)
4. Find 2-4 credible, recent news sources (from Tier 1 preferred)
5. Verify all URLs are real and currently working
6. Start with a compelling hook (surprising fact or question)
7. End with insight or call-to-action
8. Tone: Professional but accessible, objective, journalistic

STRUCTURE:
- Hook (5 sec): Grab attention
- Context (25 sec): Explain with details
- Conflict (15 sec): Describe challenge/implication
- Resolution (15 sec): Insight or forward-looking statement

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown code blocks, no extra text):

{
  "success": true,
  "script": "Full 300-350 word video script here...",
  "visual_prompt": "A highly detailed, cinematic visual description of the scene that should be generated for the video background. Must be under 1000 characters. Do not include dialogue. e.g. 'Cinematic drone shot of a futuristic city at sunset, neon lights glowing...'",
  "title": "One-line headline suitable for video title (under 100 chars)",
  "hook": "First 20 words that grab attention (under 50 chars)",
  "estimated_duration": 60,
  "sources": [
    {
      "title": "Exact headline from the article",
      "url": "https://example.com/exact-article-url",
      "publication": "Reuters",
      "author": "John Smith",
      "date": "2026-05-08",
      "credibility": "tier1"
    },
    {
      "title": "Second source headline",
      "url": "https://...",
      "publication": "BBC",
      "author": "Jane Doe",
      "date": "2026-05-09",
      "credibility": "tier1"
    }
  ],
  "metadata": {
    "topic": "{topic}",
    "generated_at": "2026-05-08T10:30:00Z",
    "word_count": 325,
    "source_count": 3,
    "confidence": 0.92
  }
}

ERROR RESPONSE (if unable to find sources or generate):
{
  "success": false,
  "error": "Unable to find credible sources for this topic",
  "suggestion": "Try rephrasing your topic, for example: 'technology policy news' or 'climate change developments'",
  "fallback_topic": "Latest technology news"
}

CRITICAL INSTRUCTIONS:
- Count words carefully (must be 300-350, not 290 or 360)
- Verify all URLs before including them
- Do NOT make up sources
- Do NOT use AI-generated news
- Do NOT cite social media as primary source
- Return ONLY the JSON object, nothing else
```

---

## Implementation (Code)

```typescript
// lib/prompts.ts
import fs from 'fs';
import path from 'path';

export function loadNewsToScriptPrompt(topic: string): {
  system: string;
  user: string;
} {
  const promptDir = path.join(process.cwd(), 'prompts', 'user');
  
  // Load system prompts
  const journalistRole = fs.readFileSync(
    path.join(process.cwd(), 'prompts', 'system', 'journalist_role_v1.0.md'),
    'utf-8'
  );
  const videoOptimization = fs.readFileSync(
    path.join(process.cwd(), 'prompts', 'system', 'video_script_optimization_v1.0.md'),
    'utf-8'
  );
  const sourceValidation = fs.readFileSync(
    path.join(process.cwd(), 'prompts', 'system', 'source_validation_v1.1.md'),
    'utf-8'
  );

  const system = [journalistRole, videoOptimization, sourceValidation]
    .map(p => extractPromptText(p))
    .join('\n\n---\n\n');

  // Format user prompt with topic
  const userTemplate = fs.readFileSync(
    path.join(promptDir, 'news_to_script_v1.0.md'),
    'utf-8'
  );
  
  const user = extractPromptText(userTemplate).replace(/{topic}/g, topic);

  return { system, user };
}

function extractPromptText(markdown: string): string {
  // Remove markdown headers, keep only prompt text
  return markdown
    .split('---')[1]?.trim() || markdown
    .split('\n')
    .filter(line => !line.startsWith('#') && line.trim())
    .join('\n');
}
```

---

## Testing

Test with these topics (should all pass):

✅ Easy:
- "artificial intelligence"
- "climate change"
- "space exploration"

⚠️ Medium:
- "AI regulation in Europe"
- "Bitcoin halving"
- "Tesla earnings"

🔴 Hard:
- "Obscure startup X raises funding"
- "Random gibberish"

Expected results:
- Easy topics: 95%+ pass rate
- Medium topics: 85%+ pass rate
- Hard topics: 50-70% pass rate (may fail, that's ok)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Returns non-JSON | Check system prompt includes "return ONLY valid JSON" |
| Script too short | Ensure topic is specific enough to generate 300+ words |
| Hallucinated sources | Add emphasis: "VERIFY all URLs are real" |
| Timeout | Topic may be too complex; simplify |
