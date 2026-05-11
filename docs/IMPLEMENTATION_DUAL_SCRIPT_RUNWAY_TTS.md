# 🎬 NEWSREEL AI — IMPLEMENTATION: DUAL-SCRIPT + RUNWAY TTS

**Version:** 2.0 (Updated for Option A+B with Runway TTS)  
**Target:** Antigravity AI Code Editor  
**Goal:** Generate visual script + readable script + TTS narration in one unified flow  
**Status:** Ready for implementation  

---

## EXECUTIVE SUMMARY

### What Changed

**Before:**
- User enters topic → Gemini generates 350-word news script → Runway crashes (too long, wrong format)
- User stares at spinner for 4 minutes
- No audio option

**After:**
- User enters topic → Gemini generates BOTH scripts + sources (instant)
- Shows Script B (readable) + Sources + [Listen] button immediately
- User reads/listens while video generates in background
- Optional Runway TTS gives professional narration
- Video arrives after 4 minutes as visual confirmation

### The Two Scripts

**Script A: Visual Description (for Runway video generation)**
- 100-150 characters max
- Pure cinematography language: "imagine," "we see," "shot of," "pans to"
- No facts, no dialogue, no statistics
- Example: "Solar farm at sunrise. Golden light on panels. Camera pans across vast field. Cut to climate scientist, serious expression. Maps behind showing growth trajectory."

**Script B: News Summary (for human reading/listening)**
- 250 words EXACTLY
- Professional news tone (BBC/Reuters style)
- Includes facts, dates, names, statistics
- Structure: Hook → Context → Impact → Why it matters
- Suitable for text-to-speech and human reading

---

## 1. GEMINI PROMPT (One Call, Both Scripts)

### Prompt Name: `UW-003: Dual-Script Generation`

### Input
```
Topic: string (e.g., "AI regulation")
```

### Output
```
{
  "success": true,
  "script_visual": "Visual description for video...",
  "script_readable": "News summary for reading...",
  "title": "One-line headline",
  "sources": [
    { "title": "...", "url": "...", "publication": "...", "author": "...", "date": "...", "credibility": "tier1" }
  ],
  "metadata": {
    "topic": "...",
    "word_count_readable": 250,
    "char_count_visual": 145,
    "confidence": 0.92
  }
}
```

### The Actual Prompt to Send to Gemini

```
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
    },
    {...},
    {...}
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
```

---

## 2. RUNWAY TTS API INTEGRATION

### When to Use
User clicks [🔊 Listen to summary] button → Script B → Runway TTS → Audio file

### API Endpoint
```
POST https://api.runwayml.com/v1/text_to_speech
```

### Request Format
```
{
  "model": "gen4.5",
  "text": "{script_b_news_summary}",
  "voice": "default",
  "output_format": "mp3"
}
```

### Response Format
```
{
  "id": "tts_task_123...",
  "status": "QUEUED",
  "estimated_wait_time": 30
}
```

Then poll for completion (similar to video generation):
```
GET /v1/tasks/{tts_task_id}

Response when done:
{
  "id": "tts_task_123...",
  "status": "SUCCEEDED",
  "output": {
    "audio_url": "https://cdn.runwayml.com/tasks/audio_...mp3"
  }
}
```

### Timeout Strategy (2 Minutes)
- User clicks [🔊 Listen] button
- Request sent to Runway TTS
- Show loading state: "Generating audio... this may take up to 2 minutes"
- Poll every 2 seconds for completion
- If not done after 120 seconds (2 min), show error: "Audio generation taking longer than expected. You can still read the summary or try again."
- Disable button, user can try again later

---

## 3. DATA STRUCTURE (TypeScript)

### Update `lib/types.ts`

```typescript
interface GenerateNewsResponse {
  success: boolean;
  script_visual: string;        // For Runway (100-150 chars)
  script_readable: string;      // For user reading (250 words)
  title: string;                // One-line headline
  sources: NewsSource[];
  metadata: {
    topic: string;
    word_count_readable: number;
    char_count_visual: number;
    confidence: number;
  };
}

interface TTSResponse {
  audio_url: string;
  tts_task_id: string;
  generated_at: string;
}

interface NewsSource {
  title: string;
  url: string;
  publication: string;
  author: string;
  date: string;                 // YYYY-MM-DD
  credibility: 'tier1' | 'tier2';
}
```

---

## 4. GEMINI API CALL (Updated)

### Location: `lib/gemini.ts`

### Function: `generateDualScriptAndSources(topic: string)`

```
Input: topic (string)

Steps:
1. Load prompt from prompts/user/dual_script_generation_v1.0.md
2. Replace {topic} with user input
3. Call Gemini 2.5 Flash with:
   - temperature: 0.3 (low for consistency)
   - maxOutputTokens: 2000 (both scripts + sources)
4. Parse JSON response
5. Validate:
   - script_visual length < 150 chars
   - script_readable word count = 250 (approximately, allow ±5)
   - sources.length >= 2
   - all URLs valid
6. Return GenerateNewsResponse

Error handling:
- If JSON parsing fails: Extract JSON with regex, retry parse
- If validation fails: Return detailed error with suggestion
- If sources not found: Return error with fallback topic
```

---

## 5. RUNWAY VIDEO + TTS FLOW (Updated API Route)

### Location: `app/api/generate/route.ts`

### New Flow

```
POST /api/generate
Input: { topic: string }

Step 1: Generate both scripts + sources (Gemini)
├─ Call: generateDualScriptAndSources(topic)
├─ Returns: { script_visual, script_readable, sources, title }
└─ Time: ~3 seconds

Step 2: Start video generation (Runway)
├─ Input: script_visual only
├─ Call: generateVideo(script_visual)
├─ Returns: video_task_id
└─ Status: Now polling in background, doesn't block response

Step 3: Return immediately to user
└─ Response includes:
   {
     "script_readable": "250-word summary",
     "title": "headline",
     "sources": [...],
     "video_status": "generating",
     "video_task_id": "runway_task_123...",
     "tts_ready": false,
     "tts_url": null
   }

Step 4: User can see Script B + Sources immediately (no wait)

Step 5 (Async): Video continues generating in background
├─ Backend polls Runway every 3 seconds
├─ When video ready: Emit event or update DB (if needed)
└─ Frontend polls for video status

Step 6 (User Action): User clicks [🔊 Listen]
├─ Frontend sends: { script_readable, task_id }
├─ Backend calls: Runway TTS API
├─ Shows spinner: "Generating audio (up to 2 min)"
├─ Polls every 2 seconds for audio_url
├─ Timeout after 120 seconds
└─ Returns audio_url when ready

Step 7: All complete
├─ Script B visible (read)
├─ Audio playing (listen)
├─ Video auto-plays when ready
└─ Sources clickable
```

### Code Flow (Pseudocode)

```
export async function POST(request: NextRequest) {
  const { topic } = await request.json()
  
  TRY:
    // Step 1: Get both scripts + sources
    const scriptData = await generateDualScriptAndSources(topic)
    
    // Step 2: Start video generation (don't wait)
    const videoTaskId = await generateVideo(scriptData.script_visual)
    
    // Step 3: Return immediately with script_readable + sources
    return Response.json({
      success: true,
      script_readable: scriptData.script_readable,
      title: scriptData.title,
      sources: scriptData.sources,
      video_task_id: videoTaskId,
      video_status: "generating",
      tts_ready: false,
      generated_at: Date.now()
    })
    
  CATCH error:
    return error response with user-friendly message
}
```

---

## 6. TTS ENDPOINT (New)

### Location: `app/api/tts/route.ts`

### Purpose
Handle Runway TTS generation with 2-minute timeout

### Flow

```
POST /api/tts
Input: { script_readable: string, task_id: string }

Step 1: Validate input
├─ script_readable exists
├─ script_readable length reasonable
└─ task_id exists (for tracking)

Step 2: Call Runway TTS
├─ POST to /v1/text_to_speech
├─ Model: gen4.5
├─ Voice: default
└─ Returns: tts_task_id

Step 3: Poll for completion (max 120 seconds)
├─ Poll every 2 seconds
├─ Check status: QUEUED → IN_PROGRESS → SUCCEEDED
├─ If SUCCEEDED: return audio_url
├─ If 120 seconds elapsed: return timeout error
└─ If FAILED: return error with retry suggestion

Response on success:
{
  "success": true,
  "audio_url": "https://cdn.runwayml.com/...",
  "duration_seconds": 120,
  "generated_at": "ISO timestamp"
}

Response on timeout (after 2 min):
{
  "success": false,
  "error": "Audio generation took too long (exceeded 2 minutes)",
  "suggestion": "Try again later or read the text summary instead",
  "can_retry": true
}
```

### Code Logic (Pseudocode)

```
export async function POST(request: NextRequest) {
  const { script_readable, task_id } = await request.json()
  
  TRY:
    // Call Runway TTS
    const ttsTaskId = await createRunwayTTSTask(script_readable)
    
    // Poll for completion (max 120 seconds)
    const startTime = Date.now()
    const maxWait = 120 * 1000  // 2 minutes
    const pollInterval = 2 * 1000  // 2 seconds
    
    WHILE (Date.now() - startTime < maxWait):
      const ttsStatus = await getRunwayTTSStatus(ttsTaskId)
      
      IF ttsStatus.status === "SUCCEEDED":
        RETURN { audio_url: ttsStatus.output.audio_url }
      
      IF ttsStatus.status === "FAILED":
        RETURN error: "TTS generation failed"
      
      WAIT pollInterval milliseconds
    
    // If we get here, timeout
    RETURN error: "TTS generation timeout (exceeded 2 minutes)"
    
  CATCH error:
    RETURN error response
}
```

---

## 7. FRONTEND COMPONENTS (Updated)

### Component: `ResultPage.tsx` (Major Changes)

```
What's displayed immediately:
├─ Title (headline)
├─ Script B (250 words) - readable
│  └─ With [🔊 Listen] button (manual TTS trigger)
├─ Sources list (3 sources with links)
├─ Video player placeholder (shows "Generating... 4 minutes")
│  └─ Updates when video ready
└─ [Generate another] button

User interactions:
1. Can read Script B immediately (no wait)
2. Can click [🔊 Listen] to start TTS
   ├─ Shows spinner: "Generating audio..."
   ├─ After 2 min timeout: "Taking longer than expected"
   └─ When ready: Audio player appears, auto-plays or manual play
3. Video appears after 4 minutes, auto-plays
4. Can click sources to read original articles
```

### Component: `ScriptCard.tsx` (New)

```
Display: Script B (250 words) in readable format

Features:
├─ Clean typography (16px, line-height 1.7)
├─ [🔊 Listen] button above or beside script
├─ Loading state when TTS generating
├─ Timeout message if TTS fails
├─ Audio player appears when TTS ready
├─ "Copy script" button (optional)
└─ Word count display (e.g., "250 words, ~2 min read")
```

### Component: `AudioPlayer.tsx` (New)

```
Display: Audio narration of Script B

Features:
├─ Standard HTML5 audio player
├─ Controls: play, pause, seek, volume
├─ Show duration (e.g., "2:15 audio")
├─ Fade in animation when appears
├─ Optional: Show transcript toggle
└─ Error state if audio fails to load
```

### UI Layout (New Flow)

```
[Back to generator]

Title: "Climate Crisis: Hottest Year on Record"

┌─ SCRIPT SUMMARY ──────────────────┐
│                                   │
│ [🔊 Listen] [Copy]               │
│                                   │
│ On May 8th, 2026, the IPCC        │
│ announced that the last 12        │
│ months were the hottest on        │
│ record... [250 words total]       │
│                                   │
│ When TTS ready:                   │
│ [Audio player controls]           │
└───────────────────────────────────┘

┌─ SOURCES (3) ─────────────────────┐
│ ✓ Source 1: "Climate change..."   │
│   BBC News • Matt McGrath • ...   │
│                                   │
│ ✓ Source 2: "UN warns world..."   │
│   Reuters • Valeria Volcovici ...│
│                                   │
│ ✓ Source 3: "Global renewable..." │
│   The Guardian • Damian Car...   │
└───────────────────────────────────┘

┌─ VIDEO (Generating...) ───────────┐
│                                   │
│ [Spinner] Generating video        │
│ (Usually 4 minutes)               │
│                                   │
│ When ready: [Video player]        │
└───────────────────────────────────┘

[Generate another] [Download] [Share]
```

---

## 8. ERROR HANDLING & TIMEOUTS

### Timeout: TTS (2 Minutes)

```
Trigger: User clicks [🔊 Listen]

Timeline:
├─ 0 sec: Show spinner "Generating audio..."
├─ 30 sec: Still generating... [still visible]
├─ 60 sec: Getting close... [optional status update]
├─ 120 sec: TIMEOUT
│           Show error: "Audio generation took longer than expected.
│           You can still read the summary or try again later."
│           Disable button for 5 minutes
└─ User can manually retry after timeout

Code implementation:
IF elapsed_time > 120_seconds:
  RETURN { error: "timeout", can_retry: true }
  HIDE spinner
  SHOW error message
  DISABLE [🔊 Listen] button for 5 minutes
ENDIF
```

### Timeout: Video (Already Handled)

```
Existing timeout: 120 seconds for Runway video generation
If exceeds: Show error "Video generation taking too long, try simpler topic"
```

### Error Messages (User-Friendly)

```
TTS Errors:
├─ Timeout: "Audio generation took longer than expected (2+ min). Try again later."
├─ Network: "Unable to connect to audio service. Check your connection."
└─ Invalid: "Audio generation failed. Try a different topic."

Gemini Errors:
├─ No sources: "Couldn't find credible sources for that topic. Try: 'technology news'"
├─ Invalid JSON: "Generation error. Please try again."
└─ Timeout: "Research taking too long. Try a simpler topic."

Runway Video Errors:
├─ Timeout: "Video generation exceeded 2 minutes. Try a shorter topic."
├─ Invalid script: "Video format error. Please try again."
└─ API error: "Video service unavailable. Try again in a moment."
```

---

## 9. TESTING CHECKLIST

### Before Deploying

```
Gemini Dual-Script Generation:
├─ [ ] script_visual is < 150 characters
├─ [ ] script_readable is ~250 words
├─ [ ] No facts in script_visual
├─ [ ] No visual descriptions in script_readable
├─ [ ] Sources are real, with valid URLs
├─ [ ] script_readable is TTS-friendly (no abbreviations)
└─ [ ] JSON validation passes

Runway Video Generation:
├─ [ ] script_visual sends correctly to Runway
├─ [ ] Video generates in ~4 minutes
├─ [ ] Video quality is acceptable
└─ [ ] Video URL is playable

Runway TTS Generation:
├─ [ ] TTS triggers when user clicks [🔊 Listen]
├─ [ ] Audio generates in < 2 minutes
├─ [ ] Audio quality is professional
├─ [ ] Timeout after 2 minutes works correctly
├─ [ ] Error handling shows user-friendly message
└─ [ ] Audio player works in all browsers

Frontend:
├─ [ ] Script B displays immediately (no wait)
├─ [ ] Sources display with clickable links
├─ [ ] [🔊 Listen] button works
├─ [ ] TTS loading spinner visible
├─ [ ] Video placeholder shows "Generating..."
├─ [ ] Video appears auto-play when ready
├─ [ ] Mobile responsive layout
└─ [ ] No layout shift when components appear

End-to-End Flow:
├─ [ ] Enter topic
├─ [ ] Script B + Sources appear (< 5 sec)
├─ [ ] Can read Script B while waiting
├─ [ ] Can click [🔊 Listen] and hear narration
├─ [ ] Video arrives after 4 minutes
├─ [ ] All three elements (text, audio, video) work together
└─ [ ] No errors or crashes
```

### Test Topics

```
Easy (should all pass):
├─ "artificial intelligence"
├─ "climate change"
└─ "technology news"

Medium (test reliability):
├─ "AI regulation in Europe"
├─ "renewable energy growth"
└─ "cryptocurrency regulations"

Edge cases (test error handling):
├─ "random gibberish" → should show error
├─ "very obscure topic" → should fallback or error
└─ Leave topic empty → should show validation error
```

---

## 10. ENVIRONMENT VARIABLES

### Add to `.env.local`

```
# Existing
GEMINI_API_KEY=your_gemini_key
RUNWAY_API_KEY=your_runway_key

# New for TTS
RUNWAY_TTS_ENABLED=true
TTS_TIMEOUT_SECONDS=120
TTS_POLL_INTERVAL_MS=2000
```

---

## 11. PROMPT FILES (To Create)

### Create: `prompts/user/dual_script_generation_v1.0.md`

This file contains the full Gemini prompt from Section 1.

File structure:
```
# User Workflow: Dual-Script Generation
**Version:** 1.0
**Purpose:** Generate visual script + readable script + sources
**Input:** topic string
**Output:** JSON with both scripts + sources

## Prompt Text
[Paste the full Gemini prompt from Section 1]

## Testing
[Include test cases and expected output]
```

---

## 12. IMPLEMENTATION CHECKLIST (For Antigravity)

### Phase 1: Update Prompts (30 min)
- [ ] Create `prompts/user/dual_script_generation_v1.0.md`
- [ ] Update `lib/prompts.ts` to load dual script prompt
- [ ] Test Gemini call returns correct JSON structure

### Phase 2: Update Gemini Integration (1 hour)
- [ ] Create `generateDualScriptAndSources()` function in `lib/gemini.ts`
- [ ] Add JSON validation for both scripts
- [ ] Add error handling and fallbacks
- [ ] Test with 5 different topics

### Phase 3: Runway TTS Integration (1.5 hours)
- [ ] Create `generateRunwayTTS()` function in `lib/runway.ts`
- [ ] Create `pollRunwayTTSStatus()` for polling
- [ ] Add 2-minute timeout handling
- [ ] Add error messages and retry logic
- [ ] Test TTS generation

### Phase 4: API Route Updates (1 hour)
- [ ] Update `/api/generate` to use dual scripts
- [ ] Create `/api/tts` endpoint
- [ ] Ensure video generation happens in background (doesn't block response)
- [ ] Test both endpoints

### Phase 5: Frontend Components (2 hours)
- [ ] Create `ScriptCard.tsx` component
- [ ] Create `AudioPlayer.tsx` component
- [ ] Update `ResultPage.tsx` to show script immediately
- [ ] Add [🔊 Listen] button with TTS trigger
- [ ] Add TTS loading state and timeout handling
- [ ] Update `VideoPlayer.tsx` to show status

### Phase 6: Styling & Polish (1 hour)
- [ ] Tailwind styling for new components
- [ ] Responsive design on mobile
- [ ] Loading spinners and transitions
- [ ] Error state styling
- [ ] Icon integration (Tabler icons, no emoji)

### Phase 7: Testing (1.5 hours)
- [ ] Unit tests for script generation
- [ ] Integration test: topic → dual scripts → video + TTS
- [ ] Error handling tests (timeouts, invalid topics)
- [ ] Mobile/responsive testing
- [ ] Live testing with 5 topics

### Phase 8: Deployment & Polish (30 min)
- [ ] Environment variables configured
- [ ] Deploy to Vercel
- [ ] Final smoke tests
- [ ] Record demo video

**Total time estimate: 9-10 hours spread across Saturday**

---

## 13. QUICK REFERENCE

### New Data Flow

```
User Input
    ↓
Gemini (1 call):
├─ script_visual (100 chars) → for Runway
├─ script_readable (250 words) → for user
├─ sources (3) → for user
└─ title → for user

Display Immediately:
├─ script_readable (user reads)
├─ sources (user clicks)
└─ [🔊 Listen] button

Parallel Processes:
├─ Runway video generation (4 min)
└─ (Optional) TTS when user clicks [🔊 Listen] (2 min max)

Final Result:
├─ Text (Script B)
├─ Audio (TTS of Script B)
├─ Visual (Runway video)
└─ Sources (clickable links)
```

### API Endpoints

```
POST /api/generate
Input: { topic: string }
Output: { script_readable, title, sources, video_task_id, video_status }
Speed: < 5 seconds

POST /api/tts
Input: { script_readable: string, task_id: string }
Output: { audio_url } or { error }
Speed: < 120 seconds
Timeout: 2 minutes
```

### Key Parameters

```
Gemini:
- temperature: 0.3 (deterministic)
- maxOutputTokens: 2000

Runway Video:
- model: gen4.5
- input: script_visual (100-150 chars)
- duration: 10 seconds
- ratio: 1280:720

Runway TTS:
- model: gen4.5
- input: script_readable (250 words)
- voice: default
- timeout: 120 seconds
```

---

## 14. COMMON ISSUES & SOLUTIONS

### Issue 1: Script B is not 250 words
**Solution:** Gemini sometimes generates 240 or 260. Accept ±10 words. If > 300 or < 200, reject and show error.

### Issue 2: Script A contains facts/dates
**Solution:** Validation will catch it. If detected, ask Gemini to regenerate Script A only (cleaner than rejecting both).

### Issue 3: TTS audio quality is robotic
**Solution:** This is Runway's default voice. Acceptable for MVP. If needed later, switch to Eleven Labs for natural voice.

### Issue 4: Video generation still takes 4 minutes
**Solution:** That's Runway's limit. Offset the wait by showing Script B + Sources immediately so user gets value early.

### Issue 5: User clicks [🔊 Listen], then closes browser
**Solution:** TTS generation continues server-side but is wasted. Acceptable for MVP. Session management can be added later.

---

## 15. NEXT STEPS

1. **Read this document** in Antigravity
2. **Create `prompts/user/dual_script_generation_v1.0.md`** with Section 1 prompt
3. **Implement Gemini integration** (Section 4)
4. **Implement TTS integration** (Section 2, 6)
5. **Update frontend** (Section 7)
6. **Test end-to-end** (Section 9)
7. **Deploy** (Section 12, Phase 8)

---

**File prepared for:** Antigravity AI Code Editor  
**Implementation time:** ~10 hours  
**Difficulty:** Medium (clear requirements, existing patterns to follow)  
**Status:** Ready to implement ✅

---

**Last updated:** May 2026  
**Version:** 2.0 (Dual-Script + Runway TTS)
