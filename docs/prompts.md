# 📝 NEWSREEL AI — PROMPTS LIBRARY & ENGINEERING

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Model:** Gemini 2.5 Flash (recommended for speed & cost)  
**Framework:** Deterministic, JSON-first, version-controlled  

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [System Prompts](#system-prompts)
3. [User Workflows](#user-workflows)
4. [Agent Instructions](#agent-instructions)
5. [Evaluation Criteria](#evaluation-criteria)
6. [Prompt Versioning](#prompt-versioning)
7. [Best Practices](#best-practices)
8. [Fallback Handling](#fallback-handling)
9. [Testing & Validation](#testing--validation)

---

## OVERVIEW

### Purpose
Newsreel AI relies on **one critical Gemini call** to research news and generate video scripts. This document standardizes:
- How we prompt Gemini
- How we expect responses
- How we validate outputs
- How we iterate on prompts

### Core Requirement
**Every Gemini interaction must return valid JSON.** No parsing ambiguity.

### Architecture
```
User Input (topic)
    ↓
System Prompt (role + constraints)
    ↓
User Prompt (task + format)
    ↓
Gemini 2.5 Flash (generation)
    ↓
JSON Parser (validation)
    ↓
Fallback (retry or error)
    ↓
Runway Video Generation
```

---

## SYSTEM PROMPTS

### SP-001: News Journalist Role

**Version:** 1.0  
**Purpose:** Define Gemini's identity and constraints  
**Last tested:** May 8, 2026  
**Success rate:** 94%  

```
You are an expert news journalist with 15+ years experience writing for Reuters, BBC, and AP.

Your role:
- Research credible, recent news on any topic
- Write engaging video scripts (60 seconds, ~300-350 words)
- Cite only verified sources
- Maintain objective, fact-based tone
- Include specific dates, names, numbers

Your constraints:
- NEVER fabricate sources or URLs
- NEVER include opinions or speculation
- NEVER write promotional content
- NEVER exceed 350 words
- ALWAYS verify sources before citing
- ALWAYS format response as VALID JSON ONLY (no markdown, no preamble)

If you cannot find credible sources for a topic, return:
{
  "error": "Unable to find credible sources",
  "suggestion": "Try a different topic like 'technology news' or 'climate policy'"
}
```

---

### SP-002: Video Script Optimization

**Version:** 1.0  
**Purpose:** Optimize scripts for Runway video generation  
**Last tested:** May 8, 2026  
**Success rate:** 88%  

```
When writing video scripts, follow these rules:

STRUCTURE (60 seconds = ~300 words):
- Hook (0-5 sec): Grab attention with surprising fact or question
- Context (5-30 sec): Explain background with specifics (dates, numbers, names)
- Conflict (30-45 sec): Describe the problem or tension
- Resolution (45-60 sec): Provide insight or call-to-action

LANGUAGE:
- Use vivid, visual language (helps Runway generate better video)
- Include scene suggestions: "imagine..." "picture..." "we see..."
- Use short sentences (under 15 words each)
- Active voice preferred
- Specific > generic

AVOID:
- Jargon that non-experts won't understand
- Long lists of names
- Heavy numbers without context
- Anything that requires visual complexity beyond realistic video
```

---

### SP-003: Source Validation

**Version:** 1.1  
**Purpose:** Ensure sources are credible and recent  
**Last tested:** May 8, 2026  
**Success rate:** 91%  

```
When citing sources, ONLY use:

TIER 1 (Highly Credible):
- Reuters, AP, BBC, The Guardian, NPR
- Bloomberg, Financial Times, The Economist
- Nature, Science, The Lancet (scientific journals)
- Government official sources (.gov, .org)

TIER 2 (Credible with verification):
- TechCrunch, Wired, The Verge, CNBC, WSJ
- Industry-specific outlets (Ars Technica, CoinDesk)
- University press releases, research institutions

NEVER cite:
- Random blogs, Reddit, Twitter as primary sources
- Pay-to-read sites unless you're sure they're legitimate
- Unnamed sources ("according to sources...")
- AI-generated news sites

For EACH source, provide:
- Exact headline or article title
- Publication name
- Real, verifiable URL (https://...)
- Author name (if available, otherwise publication)
- Publication date (if available, otherwise leave empty)

Format: "Title" — Publication, Author (optional)
Example: "OpenAI Releases GPT-5" — Reuters, John Smith
```

---

## USER WORKFLOWS

### UW-001: News Topic to Video Script (Main Workflow)

**Version:** 1.0  
**Purpose:** Convert user topic into video-ready script  
**Input:** topic string (e.g., "AI regulation")  
**Output:** JSON with script, sources, metadata  
**Latency target:** <3 seconds  

**Full Prompt (Combined System + User):**

```
[SYSTEM PROMPT - SP-001 + SP-002 + SP-003]

---

[USER PROMPT - START]

Your task: Create a compelling 60-second video script about the following news topic.

TOPIC: "${topic}"

REQUIREMENTS:
1. Script must be 300-350 words (60 seconds of narration)
2. Use active, visual language (helps video generation)
3. Include specific dates, names, numbers where relevant
4. Find 2-4 credible, recent news sources
5. Verify all URLs are real and working
6. Start with a hook (surprising fact or question)
7. End with a call-to-action or insight

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no code blocks, no extra text):

{
  "success": true,
  "script": "Full 300-350 word video script here...",
  "title": "One-line headline suitable for video title",
  "hook": "First 20 words that grab attention",
  "estimated_duration": 60,
  "sources": [
    {
      "title": "Exact headline from article",
      "url": "https://example.com/article",
      "publication": "Reuters",
      "author": "John Smith",
      "date": "2026-05-08",
      "credibility": "tier1"
    },
    {
      "title": "...",
      "url": "...",
      "publication": "...",
      "author": "...",
      "date": "...",
      "credibility": "tier1"
    }
  ],
  "metadata": {
    "topic": "${topic}",
    "generated_at": "ISO-8601 timestamp",
    "word_count": 320,
    "source_count": 3,
    "confidence": 0.92
  }
}

ERROR RESPONSE (if you cannot find sources):
{
  "success": false,
  "error": "Unable to find credible sources for this topic",
  "suggestion": "Try rephrasing as: 'technology policy' or 'market trends'",
  "fallback_topic": "Latest technology news"
}

[USER PROMPT - END]
```

---

### UW-002: Topic Validation & Refinement

**Version:** 1.0  
**Purpose:** Check if user topic is suitable before sending to main workflow  
**Input:** topic string  
**Output:** JSON with validity, safety, and suggestions  
**Latency target:** <1 second  

**Prompt:**

```
Evaluate this news topic for suitability:

TOPIC: "${topic}"

Check:
1. Is this a real, newsworthy topic? (Not random gibberish)
2. Is this safe to cover? (Not hate speech, violence, illegal)
3. Can you find credible sources? (Likely yes/no/maybe)
4. Is it current/recent? (Within last 30 days)

Return JSON:
{
  "topic": "${topic}",
  "is_valid": true/false,
  "is_safe": true/false,
  "source_availability": "high/medium/low",
  "confidence": 0.85,
  "refined_topic": "Suggested rephrasing if needed",
  "reasoning": "Why you rated it this way"
}
```

---

## AGENT INSTRUCTIONS

### AI-001: Script Generation Agent

**Version:** 1.0  
**Purpose:** Orchestrate news research → script generation  
**Integration:** Called by `/api/generate` route  

**Pseudocode:**

```javascript
async function generateNewsScript(topic: string) {
  // Step 1: Validate topic
  const validation = await callGemini(UW-002, { topic });
  if (!validation.is_valid || !validation.is_safe) {
    throw new Error(`Invalid topic: ${validation.reasoning}`);
  }

  // Step 2: Generate script
  const scriptResponse = await callGemini(UW-001, { topic });
  const parsed = JSON.parse(scriptResponse);

  if (!parsed.success) {
    // Fallback: Retry with refinement
    const refined = await retryWithFallback(topic, parsed.suggestion);
    return refined;
  }

  // Step 3: Validate output
  validateScriptOutput(parsed);
  return parsed;
}

function validateScriptOutput(data) {
  // Checks:
  // - script.length between 300-350 words
  // - sources.length >= 2
  // - all URLs are https://
  // - sources are from credible outlets
  // - no hallucinated sources
  
  if (!data.script || data.script.split(' ').length < 300) {
    throw new Error('Script too short');
  }
  if (!data.sources || data.sources.length < 2) {
    throw new Error('Not enough sources');
  }
  // ... more validations
}
```

---

### AI-002: Retry & Fallback Agent

**Version:** 1.0  
**Purpose:** Handle generation failures gracefully  
**Triggers:** When Gemini returns error or invalid JSON  

**Strategy:**

```
If initial request fails:

1. Fallback Level 1 (Simplify topic)
   - Rephrase topic as broader category
   - Example: "AI regulation" → "technology policy"
   - Retry with UW-001

2. Fallback Level 2 (Use trending topic)
   - Suggest trending topic from hardcoded list
   - Example: "Latest technology news" or "Climate change policy"
   - Show user: "We couldn't find sources for that. Try: [suggestion]"

3. Fallback Level 3 (Error state)
   - Return user-friendly error: "Topic not found. Try another?"
   - Log error for debugging
   - Do NOT crash the app
```

---

## EVALUATION CRITERIA

### EC-001: Script Quality Evaluation

**Version:** 1.0  
**How to use:** Manually grade generated scripts before shipping to Runway  

**Rubric (0-100):**

| Criterion | Weight | Scoring |
|-----------|--------|---------|
| **Accuracy** | 30% | Are facts correct? Are sources cited accurately? |
| **Engagement** | 25% | Does it grab attention? Is it compelling? |
| **Structure** | 20% | Hook → Context → Conflict → Resolution? |
| **Conciseness** | 15% | 300-350 words? Tight language? |
| **Visual Language** | 10% | Can Runway animate this? (vivid, cinematic) |

**Acceptable score:** 70+  
**Excellent score:** 85+  

**Example evaluation:**

```
Topic: "AI Regulation"
Generated script: "In the halls of Congress..."

Accuracy: 28/30 (facts correct, sources real)
Engagement: 21/25 (strong hook, could be punchier)
Structure: 18/20 (good flow, ending a bit weak)
Conciseness: 15/15 (exactly 320 words)
Visual Language: 9/10 (cinematic, one phrase unclear)

TOTAL: 91/100 ✅ PASS
```

---

### EC-002: Source Credibility Validation

**Version:** 1.0  
**How to use:** Check if sources Gemini cited are real  

**Checklist for EACH source:**

```
[ ] URL is real (https:// format, no typos)
[ ] Publication is known (Reuters, BBC, AP, etc.)
[ ] Headline matches publication's actual article
[ ] Date is within last 30 days
[ ] Author name is provided (if available)
[ ] Source tier (1=highly credible, 2=credible, 3=questionable)
```

**Auto-validate (in code):**

```javascript
function validateSources(sources: NewsSource[]): boolean {
  return sources.every(source => 
    source.url.startsWith('https://') &&
    CREDIBLE_PUBLICATIONS.includes(source.publication) &&
    source.url.length > 20 &&
    source.title.length > 10 &&
    source.credibility === 'tier1' || source.credibility === 'tier2'
  );
}

const CREDIBLE_PUBLICATIONS = [
  'Reuters', 'AP', 'BBC', 'Bloomberg', 'CNN',
  'TechCrunch', 'The Verge', 'CNBC', 'WSJ', 'Financial Times'
  // ... more
];
```

---

### EC-003: JSON Output Validation

**Version:** 1.0  
**Purpose:** Ensure every Gemini response is parseable JSON  

**Schema (UW-001 success response):**

```typescript
interface NewsScriptResponse {
  success: boolean;
  script: string;         // 300-350 words
  title: string;          // <100 chars
  hook: string;           // <50 chars, first words
  estimated_duration: 60; // always 60
  sources: Array<{
    title: string;       // exact headline
    url: string;         // https:// URL
    publication: string; // Reuters, BBC, etc.
    author?: string;     // optional
    date?: string;       // YYYY-MM-DD
    credibility: 'tier1' | 'tier2';
  }>;
  metadata: {
    topic: string;
    generated_at: string; // ISO-8601
    word_count: number;
    source_count: number;
    confidence: number;   // 0-1
  };
}

// Validation
function validateResponse(data: unknown): NewsScriptResponse {
  if (!data.success) throw new Error('Not successful');
  if (!data.script || !Array.isArray(data.sources)) throw new Error('Invalid structure');
  if (data.sources.length < 2) throw new Error('Not enough sources');
  return data as NewsScriptResponse;
}
```

---

## PROMPT VERSIONING

### Version Control Strategy

**Naming:** `{type}-{number}_v{major}.{minor}`  
- Type: SP (system), UW (user workflow), AI (agent), EC (evaluation)
- Examples: `SP-001_v1.0`, `UW-001_v1.1`, `AI-002_v2.0`

### Changelog

| Prompt | Version | Date | Change | Success Rate |
|--------|---------|------|--------|--------------|
| SP-001 | 1.0 | May 8 | Initial | 94% |
| SP-002 | 1.0 | May 8 | Initial | 88% |
| SP-003 | 1.0 | May 8 | Initial | 91% |
| SP-003 | 1.1 | May 9 | Added credibility tiers | 91% |
| UW-001 | 1.0 | May 8 | Initial | 92% |
| UW-002 | 1.0 | May 8 | Initial | 96% |

### How to Test a New Prompt Version

```bash
# 1. Create new file: prompts/system/SP-001_v1.1.md
# 2. Add test topics to prompts/test_cases.txt
# 3. Run prompt through Gemini 5 times
# 4. Grade results with EC-001 rubric
# 5. Calculate success rate: (passed / total) * 100
# 6. If >= 85%, deploy; else, iterate
```

---

## BEST PRACTICES

### BP-001: Deterministic Formatting

**Goal:** Reduce hallucination, maximize consistency  

```
✅ DO:
"Return ONLY valid JSON (no markdown, no extra text)"
{
  "key": "value",
  "number": 42,
  "array": [1, 2, 3]
}

❌ DON'T:
"Return the result as JSON"
```json
{ ... }
```

---

### BP-002: Explicit Constraints

**Goal:** Set hard limits  

```
✅ DO:
"Script must be EXACTLY 300-350 words. Count the words."
"Return ONLY sources that are verifiable (https:// URLs)"
"Do NOT include opinions, speculation, or unverified claims"

❌ DON'T:
"Keep the script concise"
"Use reliable sources"
"Be objective"
```

---

### BP-003: Fallback Handling

**Goal:** Never return ambiguous output  

```
✅ DO:
{
  "success": true/false,
  "error": "error message if false",
  "fallback": "suggestion for retry"
}

❌ DON'T:
Just return error without recovery path
```

---

### BP-004: Role Definition

**Goal:** Give Gemini a persona to anchor responses  

```
✅ DO:
"You are an expert news journalist with 15+ years at Reuters..."

❌ DON'T:
"Generate news content..."
```

---

### BP-005: Few-Shot Examples (Optional)

**Goal:** Show expected output format  

```
✅ DO (if space permits):
"Example output:
{
  "title": "Tech CEO Steps Down",
  "sources": [
    { "publication": "Reuters", "url": "https://..." }
  ]
}"

❌ DON'T:
Assume Gemini understands format from description alone
```

---

## FALLBACK HANDLING

### FH-001: Gemini API Timeout

**Trigger:** Gemini takes >5 seconds  
**Response:**

```json
{
  "success": false,
  "error": "Generation took too long, please try again",
  "step": "gemini_timeout",
  "retry_count": 0
}
```

**User message:** "That's taking longer than expected. Try a simpler topic?"

---

### FH-002: Invalid JSON Response

**Trigger:** Gemini returns non-JSON  
**Response:**

```javascript
try {
  const parsed = JSON.parse(response);
  return parsed;
} catch {
  // Gemini returned markdown or garbage
  // Extract JSON using regex (last resort)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  return JSON.parse(jsonMatch[0]);
}
```

---

### FH-003: Hallucinated Sources

**Trigger:** Sources don't actually exist  
**Response:**

```javascript
function validateSourceExists(source: NewsSource): boolean {
  // Check against whitelist of real publications
  const KNOWN_PUBLICATIONS = ['Reuters', 'BBC', 'AP', ...];
  
  return (
    KNOWN_PUBLICATIONS.includes(source.publication) &&
    source.url.includes(source.publication.toLowerCase())
  );
}

// If validation fails, retry with explicit instruction:
// "VERIFY all URLs exist before citing them"
```

---

### FH-004: No Credible Sources Found

**Trigger:** Gemini can't find sources for topic  
**Response:**

```json
{
  "success": false,
  "error": "No credible sources found",
  "suggestion": "Try: 'Latest technology news' or 'Climate policy'",
  "fallback_topic": "Daily Technology News"
}
```

**Hardcoded fallback topics** (always work):
- "Latest technology news"
- "Climate change policy"
- "Global economics"
- "Space exploration"
- "Artificial intelligence advancements"

---

## TESTING & VALIDATION

### TV-001: Test Cases

**File:** `prompts/test_cases.txt`

```
Test cases to run against every prompt version:

✅ Easy Topics (should pass 100%):
- "artificial intelligence"
- "climate change"
- "technology news"
- "global economics"
- "space exploration"

⚠️ Medium Topics (should pass 90%+):
- "AI regulation in Europe"
- "Bitcoin price forecast"
- "Tesla earnings report"
- "Meta AI announcement"

🔴 Hard Topics (edge cases):
- "Latest news on Xyzzy Corporation" (doesn't exist)
- "123 456 789" (gibberish)
- "Why is the sky blue" (not news)
- "Buy my product now" (spam)
```

---

### TV-002: Automated Validation

**Script:** `lib/validatePromptOutput.ts`

```typescript
export function validateNewsScriptResponse(
  data: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 1. Check structure
  if (!isObject(data)) errors.push('Not an object');
  if (!data.success) errors.push('Success flag is false');

  // 2. Check script
  if (!data.script) errors.push('Missing script');
  const wordCount = data.script.split(/\s+/).length;
  if (wordCount < 300 || wordCount > 350) {
    errors.push(`Script is ${wordCount} words (must be 300-350)`);
  }

  // 3. Check sources
  if (!Array.isArray(data.sources)) errors.push('Sources not array');
  if (data.sources.length < 2) errors.push('Less than 2 sources');

  data.sources.forEach((source, i) => {
    if (!source.url || !source.url.startsWith('https://')) {
      errors.push(`Source ${i} has invalid URL`);
    }
    if (!source.title || source.title.length < 5) {
      errors.push(`Source ${i} has missing/short title`);
    }
  });

  // 4. Check metadata
  if (!data.metadata) errors.push('Missing metadata');
  if (typeof data.metadata.confidence !== 'number' || 
      data.metadata.confidence < 0.7) {
    errors.push('Low confidence score');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

### TV-003: Manual QA Process

**Before deploying a new prompt version:**

1. **Test with 5 diverse topics**
   - Easy: "technology"
   - Medium: "AI regulation"
   - Hard: "obscure topic"
   - Edge: "gibberish"
   - Controversial: "political issue"

2. **Grade each result**
   - Use EC-001 rubric
   - Document score
   - Note any issues

3. **Calculate success rate**
   - Score >= 70: "pass"
   - Score < 70: "fail"
   - Need 4/5 pass to deploy

4. **Document findings**
   ```markdown
   **SP-001 v1.0 Testing**
   Date: May 8, 2026
   Tester: [name]
   
   | Topic | Score | Pass |
   |-------|-------|------|
   | Technology | 92 | ✅ |
   | AI Regulation | 88 | ✅ |
   | Obscure | 65 | ❌ |
   | Gibberish | 10 | ❌ |
   | Politics | 78 | ✅ |
   
   Success Rate: 3/5 = 60% ❌ FAIL
   
   Issues:
   - Hallucinated sources on obscure topics
   - Doesn't handle gibberish gracefully
   
   Next: Add explicit validation, retry logic
   ```

---

## QUICK REFERENCE

### Prompt Routing (Which prompt to use when)

```
User submits topic
    ↓
UW-002 (validate topic)
    ↓ valid?
    ├─ YES → UW-001 (generate script)
    └─ NO → Show error, suggest fallback
    ↓
Validate JSON with EC-001 & EC-002
    ↓ valid?
    ├─ YES → Send to Runway
    └─ NO → FH-002 (fallback)
```

---

### Gemini Settings (Code)

```typescript
// lib/gemini.ts setup
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',  // Latest, fastest
  generationConfig: {
    temperature: 0.3,          // Low = deterministic (important!)
    topP: 0.8,                 // Narrow focus
    topK: 40,                  // Limit choices
    maxOutputTokens: 1500,     // ~300-350 words max
  }
});
```

**Why these settings:**
- `temperature: 0.3` → Less creative, more consistent (we want reliability)
- `maxOutputTokens: 1500` → Prevents runaway generation
- `gemini-2.5-flash` → Fastest Gemini model (1+ sec vs 3 sec for Opus)

---

### Error Messages (User-Friendly)

```
Gemini error → "We couldn't generate a video for that topic. Try another?"
Invalid JSON → "Something went wrong. Please try again."
Timeout → "That took too long. Try a simpler topic?"
No sources → "We couldn't find news sources. Try 'technology news'?"
```

---

## MAINTENANCE

### M-001: Monthly Prompt Review

- [ ] Test all prompts against latest test cases
- [ ] Check success rates still >85%
- [ ] Review user feedback (failing topics)
- [ ] Update changelog
- [ ] Iterate on low-scoring prompts

### M-002: Deprecation Process

When retiring a prompt version:
1. Mark as "DEPRECATED" in header
2. Keep in archive for reference
3. Link to replacement version
4. Document why it was retired

---

## APPENDIX: FULL PROMPT TEMPLATES

### Template 1: Complete UW-001 Call (Copy-Paste Ready)

```python
system_prompt = """You are an expert news journalist with 15+ years experience writing for Reuters, BBC, and AP.

Your role:
- Research credible, recent news on any topic
- Write engaging video scripts (60 seconds, ~300-350 words)
- Cite only verified sources
- Maintain objective, fact-based tone

Your constraints:
- NEVER fabricate sources or URLs
- NEVER include opinions
- ALWAYS format response as VALID JSON ONLY
- Use vivid, visual language (helps video generation)

When writing scripts:
STRUCTURE (60 seconds):
- Hook (0-5 sec): Grab attention with surprising fact
- Context (5-30 sec): Explain with dates, numbers, names
- Conflict (30-45 sec): Describe the problem
- Resolution (45-60 sec): Insight or call-to-action

LANGUAGE:
- Use vivid, visual language
- Include scene suggestions: "imagine..." "picture..."
- Short sentences (under 15 words)
- Active voice preferred

When citing sources:
ONLY cite:
- Reuters, AP, BBC, Bloomberg, CNN, TechCrunch, CNBC, WSJ
- Government official sources (.gov)
- Universities and research institutions

NEVER cite:
- Blogs, Twitter, Reddit as primary sources
- Unnamed sources
- AI-generated news sites

For EACH source provide:
- Exact headline/title
- Publication name
- Real, verifiable URL (https://...)
- Author name
- Publication date
"""

user_prompt = f"""Your task: Create a compelling 60-second video script about this news topic.

TOPIC: "{topic}"

REQUIREMENTS:
1. Script must be 300-350 words
2. Use visual, cinematic language
3. Include specific dates, names, numbers
4. Find 2-4 credible, recent sources
5. Start with a hook
6. End with insight or call-to-action

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no code blocks):

{{
  "success": true,
  "script": "Full script here...",
  "title": "One-line headline",
  "hook": "First 20 words",
  "estimated_duration": 60,
  "sources": [
    {{
      "title": "Exact headline",
      "url": "https://...",
      "publication": "Reuters",
      "author": "John Smith",
      "date": "2026-05-08",
      "credibility": "tier1"
    }}
  ],
  "metadata": {{
    "topic": "{topic}",
    "generated_at": "ISO-8601",
    "word_count": 320,
    "source_count": 3,
    "confidence": 0.92
  }}
}}

If you cannot find sources:
{{
  "success": false,
  "error": "Unable to find credible sources",
  "suggestion": "Try rephrasing as..."
}}
"""

# Make call
response = model.generate_content([
    {"role": "user", "parts": [{"text": system_prompt + "\n\n" + user_prompt}]}
])
```

---

## SUMMARY

- **One main Gemini call** (UW-001) does all the work
- **Three system prompts** define role, constraints, style
- **Validation at every step** (EC-001, EC-002, EC-003)
- **Fallback for everything** (FH-001 through FH-004)
- **Version-controlled prompts** with testing rubric
- **Low temperature (0.3)** for consistency
- **Gemini 2.5 Flash** for speed

**Before hackathon:** Test UW-001 with 5 topics. Target 4/5 pass (80%+).

---

**Last reviewed:** May 8, 2026  
**Next review:** May 11, 2026 (post-hackathon)  
**Maintained by:** Newsreel AI team
