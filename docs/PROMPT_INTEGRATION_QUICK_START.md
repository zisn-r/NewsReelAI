# 🎯 PROMPT ENGINEERING — QUICK INTEGRATION GUIDE

**Purpose:** How to integrate the new prompts system into Newsreel AI  
**Time to implement:** 30 minutes (Friday evening)  
**Dependencies:** Already in `lib/gemini.ts` — just update  

---

## TLDR: What You Now Have

### 2 New Documents Created:

1. **prompts.md** — Complete prompt library with:
   - 3 system prompts (role, style, sources)
   - 2 user workflows (news-to-script, topic-validation)
   - Evaluation criteria (rubrics for grading)
   - Fallback handling strategies
   - Testing & validation methods

2. **PROMPT_ENGINEERING_DIRECTORY.md** — Implementation guide with:
   - Directory structure to create
   - Individual `.md` files for each prompt (copy-paste ready)
   - Code samples for loading prompts
   - Automated testing setup
   - Versioning strategy

---

## STEP 1: CREATE DIRECTORY STRUCTURE (5 min)

```bash
# In your newsreel-ai project root:

mkdir -p prompts/system prompts/user prompts/evals
cd prompts

# Create README
touch README.md

# Create system prompts
touch system/journalist_role_v1.0.md
touch system/video_script_optimization_v1.0.md
touch system/source_validation_v1.1.md

# Create user workflows
touch user/news_to_script_v1.0.md
touch user/topic_validation_v1.0.md

# Create eval criteria
touch evals/script_quality_rubric_v1.0.md
touch evals/source_credibility_v1.0.md

# Create supporting files
touch test_cases.txt
touch changelog.md
touch settings.json
```

---

## STEP 2: COPY PROMPT CONTENT (10 min)

**Option A: Manual Copy-Paste**

For each file, go to `PROMPT_ENGINEERING_DIRECTORY.md` and copy the content into the corresponding file.

Example:
```bash
# Copy journalist_role_v1.0.md content
# From section: "### `prompts/system/journalist_role_v1.0.md`"
# Paste into: prompts/system/journalist_role_v1.0.md
```

**Option B: Scripted (Advanced)**

Create `scripts/setupPrompts.ts`:
```typescript
// scripts/setupPrompts.ts
import fs from 'fs';
import path from 'path';

const prompts = {
  'system/journalist_role_v1.0.md': `# System Prompt: Journalist Role Definition
...
[copy full content from PROMPT_ENGINEERING_DIRECTORY.md]
...`,
  // ... repeat for all prompts
};

Object.entries(prompts).forEach(([file, content]) => {
  const filePath = path.join(__dirname, '..', 'prompts', file);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created: ${file}`);
});

console.log('✅ All prompts created!');
```

Run with:
```bash
npx ts-node scripts/setupPrompts.ts
```

---

## STEP 3: UPDATE `lib/prompts.ts` (10 min)

Copy this file into your project:

```typescript
// lib/prompts.ts
import fs from 'fs';
import path from 'path';

interface PromptConfig {
  system: string;
  user: string;
  temperature: number;
  maxTokens: number;
}

export async function loadPromptConfig(
  workflowName: 'news_to_script' | 'topic_validation',
  topic: string
): Promise<PromptConfig> {
  const promptDir = path.join(process.cwd(), 'prompts');
  
  // Load settings
  const settings = JSON.parse(
    fs.readFileSync(path.join(promptDir, 'settings.json'), 'utf-8')
  );

  let system = '';
  let user = '';

  if (workflowName === 'news_to_script') {
    // Combine all system prompts
    system = [
      'system/journalist_role_v1.0.md',
      'system/video_script_optimization_v1.0.md',
      'system/source_validation_v1.1.md'
    ]
      .map(file => readPrompt(promptDir, file))
      .join('\n\n---\n\n');

    // Load and format user prompt
    user = readPrompt(promptDir, 'user/news_to_script_v1.0.md')
      .replace(/{topic}/g, topic);
  }

  if (workflowName === 'topic_validation') {
    system = readPrompt(promptDir, 'system/journalist_role_v1.0.md');
    user = readPrompt(promptDir, 'user/topic_validation_v1.0.md')
      .replace(/{topic}/g, topic);
  }

  return {
    system,
    user,
    temperature: settings.generation_config.temperature,
    maxTokens: settings.generation_config.maxOutputTokens
  };
}

function readPrompt(promptDir: string, relativePath: string): string {
  const filePath = path.join(promptDir, relativePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract prompt text (skip markdown headers)
  const lines = content.split('\n');
  const promptStart = lines.findIndex(line => line === '## Prompt Text');
  
  if (promptStart === -1) {
    return content;
  }

  return lines
    .slice(promptStart + 1)
    .filter(line => line.trim() && !line.startsWith('#'))
    .join('\n')
    .trim();
}
```

---

## STEP 4: UPDATE `lib/gemini.ts` (5 min)

Replace your current `generateNewsScript` function with this:

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadPromptConfig } from './prompts';
import { GeminiResponse } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateNewsScript(topic: string): Promise<GeminiResponse> {
  // Step 1: Validate topic first
  const validation = await validateTopic(topic);
  if (!validation.is_valid || !validation.is_safe) {
    throw new Error(`Invalid topic: ${validation.reasoning}`);
  }

  // Step 2: Load prompts from files
  const config = await loadPromptConfig('news_to_script', topic);

  // Step 3: Create Gemini model with proper settings
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',  // ← Latest, fastest, most consistent
  });

  try {
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: config.system },
            { text: '\n\n---\n\n' },
            { text: config.user }
          ]
        }
      ],
      generationConfig: {
        temperature: config.temperature,        // 0.3 = deterministic
        maxOutputTokens: config.maxTokens,      // 1500 = ~350 words
        topP: 0.8,                              // Narrow focus
        topK: 40                                // Limit choices
      }
    });

    const responseText = response.response.text();
    
    // Step 4: Extract and parse JSON
    let jsonText = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText) as GeminiResponse;

    // Step 5: Validate output
    if (!parsed.script || !parsed.sources || parsed.sources.length < 2) {
      throw new Error('Invalid response structure');
    }

    return parsed;
  } catch (error) {
    console.error('Gemini generation error:', error);
    
    // Fallback: Retry with simplified topic
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('Retrying with fallback topic...');
      return generateNewsScript('Latest technology news');
    }
    
    throw error;
  }
}

async function validateTopic(topic: string): Promise<{
  is_valid: boolean;
  is_safe: boolean;
  source_availability: string;
  reasoning: string;
}> {
  const config = await loadPromptConfig('topic_validation', topic);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: config.system + '\n\n' + config.user }] }],
    generationConfig: {
      temperature: 0.1,           // Very deterministic for validation
      maxOutputTokens: 500
    }
  });

  const responseText = response.response.text();
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { is_valid: true, is_safe: true, source_availability: 'medium', reasoning: 'Unable to validate, proceeding' };
  }

  return JSON.parse(jsonMatch[0]);
}
```

---

## STEP 5: CREATE `prompts/settings.json` (Copy-Paste)

```json
{
  "model": {
    "name": "gemini-2.5-flash",
    "reason": "Fastest, most deterministic, good quality"
  },
  "generation_config": {
    "temperature": 0.3,
    "reason": "Low temp = consistent, deterministic responses (critical for news)",
    "topP": 0.8,
    "topK": 40,
    "maxOutputTokens": 1500,
    "reason_maxTokens": "Prevents runaway generation, 1500 tokens ≈ 350 words"
  },
  "timeout_seconds": 5,
  "reason_timeout": "Gemini should respond quickly; >5s means something is wrong",
  "retry_policy": {
    "max_retries": 2,
    "backoff_seconds": 2,
    "reason": "Retry on timeout or invalid JSON"
  },
  "response_validation": {
    "json_only": true,
    "reason": "All responses must be valid JSON for parsing"
  },
  "fallback_topics": [
    "Latest technology news",
    "Climate change developments",
    "Space exploration news",
    "Global economics",
    "Artificial intelligence advancements",
    "Healthcare innovation",
    "Renewable energy news"
  ],
  "credible_publications": [
    "Reuters", "AP", "BBC", "Bloomberg", "CNN",
    "TechCrunch", "The Verge", "CNBC", "WSJ", "Financial Times",
    "New York Times", "Washington Post", "Guardian", "NPR",
    "Nature", "Science", "The Lancet"
  ]
}
```

---

## KEY SETTINGS EXPLAINED

### Why `gemini-2.5-flash`?

```
Model          | Speed | Cost | Quality | Consistency
---------------|-------|------|---------|------------
GPT-4 Turbo    | Slow  | High | Best    | Good
Gemini 1.5 Pro | Medium| Mid  | Great   | Good
gemini-2.5-flash | FAST | LOW  | Good    | EXCELLENT ✅
Gemini 1.5     | Slow  | High | Best    | Good
```

For hackathon: **Fast + Consistent + Low cost** = `gemini-2.5-flash`

### Why `temperature: 0.3`?

```
Temperature Effect:
- 0.0 = Always same response (boring but reliable)
- 0.3 = Mostly consistent with slight variation ✅ (we want this)
- 0.7 = Creative, variable responses
- 1.0 = Wild, unpredictable responses
```

For news generation: **We need consistent, reliable scripts**, not creative ones.

### Why `maxOutputTokens: 1500`?

```
1500 tokens ≈ 350 words (perfect for 60-second video)

Prevents:
- Gemini writing 1000+ word essays (waste of credits)
- Timeout from generating too much
- Memory issues from huge responses
```

---

## INTEGRATION CHECKLIST

- [ ] Created `prompts/` directory structure
- [ ] Copied all 5 prompt files (.md files)
- [ ] Copied `prompts/settings.json`
- [ ] Updated `lib/prompts.ts`
- [ ] Updated `lib/gemini.ts` with new code
- [ ] Tested with one topic: `npm run dev`
- [ ] Input "technology news" in UI
- [ ] Got back valid video + sources
- [ ] Deployed to Vercel

---

## TESTING YOUR SETUP

### Manual Test (5 min)

```bash
# 1. Start dev server
npm run dev

# 2. Go to http://localhost:3000

# 3. Enter "artificial intelligence"

# 4. Should see:
# - Spinner for 3-5 sec (researching)
# - Video generation for 10-30 sec
# - Video + sources appear

# 5. Check console for any errors
```

### Quick Test with Curl (If API testing)

```bash
# Test /api/generate endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "bitcoin halving"}'

# Should return:
# {
#   "videoUrl": "https://...",
#   "sources": [...],
#   "title": "..."
# }
```

---

## WHAT CHANGED

### Before:
```typescript
// Old: Inline prompt
const prompt = `You are a journalist...
[hardcoded prompt text]`;

const response = await model.generateContent(prompt);
```

### After:
```typescript
// New: Loaded from files
const config = await loadPromptConfig('news_to_script', topic);
const response = await model.generateContent({
  contents: [...],
  generationConfig: { 
    temperature: config.temperature,  // Loaded from settings.json
    maxTokens: config.maxTokens
  }
});
```

**Benefits:**
- ✅ Prompts are versioned (`journalist_role_v1.0.md`)
- ✅ Easy to test new versions
- ✅ Settings centralized (`settings.json`)
- ✅ Can iterate without redeploying code
- ✅ Team can work on prompts independently

---

## QUICK REFERENCE: Prompt Files & What They Do

| File | Purpose | Used When |
|------|---------|-----------|
| `journalist_role_v1.0.md` | Define Gemini as journalist, no fake sources | Every request |
| `video_script_optimization_v1.0.md` | Make script visual, 300-350 words, cinematic | Every script |
| `source_validation_v1.1.md` | Validate sources are real (Reuters, BBC, etc.) | Every script |
| `news_to_script_v1.0.md` | Main workflow: topic → script + sources | User inputs topic |
| `topic_validation_v1.0.md` | Pre-check: is this a real topic? | Before main workflow |

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Cannot find prompts directory" | Make sure you created `prompts/` folder in root |
| "JSON.parse error" | Gemini returned non-JSON; check system prompts include "return ONLY JSON" |
| "Undefined settings.json" | Copy `settings.json` into `prompts/` directory |
| "Script is [X] words, needs 300-350" | Gemini didn't count correctly; happens on niche topics |
| "Sources are fabricated" | Topic is too obscure; try broader topic like "technology news" |

---

## NEXT STEPS (Saturday Morning)

1. **Integrate prompts** (30 min)
2. **Test happy path** (input → video) — 30 min
3. **Test edge cases** (invalid topics, timeouts) — 1 hour
4. **Deploy to Vercel** — 10 min
5. **Pre-record backup demo** — 15 min

**You're ready for hackathon! 🚀**

---

## FILES YOU NOW HAVE

1. ✅ **prompts.md** — Full documentation of all prompts, evals, versioning
2. ✅ **PROMPT_ENGINEERING_DIRECTORY.md** — Directory structure + file contents
3. ✅ **This file** — Quick integration guide
4. ✅ **Plus 3 previous documents** from yesterday:
   - NEWSREEL_AI_PRD_AND_STACK.md
   - EXPLICIT_STACK_CONFIGURATION.md
   - QUICK_REFERENCE_WEEKEND.md

**Total:** 6 comprehensive guides covering design, code, prompts, and execution.

---

## GEMINI 2.5 FLASH SETTINGS (One-Liner)

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'  // Fast + cheap + consistent
});

// With config:
generationConfig: {
  temperature: 0.3,         // Deterministic
  maxOutputTokens: 1500,    // ~350 words max
  topP: 0.8, topK: 40       // Narrow focus
}
```

That's it. Done. Ship it. 🎯

---

**Last updated:** May 9, 2026  
**For:** Hackathon May 8–11, 2026
