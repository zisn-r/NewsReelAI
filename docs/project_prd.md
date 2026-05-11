# 📰 NEWSREEL AI — Hackathon PRD & Stack

**Hackathon:** Runway API (May 8–11, 2026)  
**Team Mode:** AI-First Development (Antigravity)  
**Goal:** Ship MVP in 48 hours optimized for judge demo  
**Target Demo Time:** 90 seconds

---

## 1. PRODUCT OVERVIEW

### 1.1 Problem Statement
Users consume news passively (reading). Current issue:
- **Reading fatigue:** Long articles require sustained attention
- **Lack of visual context:** Text alone doesn't make stories memorable
- **Trust gap:** No source attribution in most AI summaries
- **Niche pain:** No existing tool that combines source-cited news summaries with cinematic video

### 1.2 Solution
**Newsreel AI** = News Topic → Gemini Research + Summary → Runway Video Generation → Source-Cited Video Result

User types a topic (e.g., "AI regulation") → system fetches credible sources, generates a script, creates a 60-second cinematic video with sources cited at the end.

**Key differentiator:** Every video is source-backed and transparent (not propaganda, not hallucination).

### 1.3 Target Users
- **Primary:** Busy professionals (30–50 years old) who want news summaries fast
- **Secondary:** News junkies, students, content creators who want to repurpose news
- **Tertiary:** Small media outlets looking for automation tools

### 1.4 Value Proposition
| Feature | Competitor | Newsreel AI |
|---------|-----------|-------------|
| News to text summary | TL;DR, Perplexity | ✓ |
| Text to video | Synthesia, Pictory | ✓ |
| Source attribution | None (hallucination risk) | ✓✓ (explicit sources) |
| One-click workflow | No | ✓ (user to video in 90 sec) |
| Real-time news | Some | ✓ (Gemini powered) |

---

## 2. SUCCESS METRICS (Hackathon Specific)

### 2.1 Demo Goals
- **Must:** User enters topic → system completes in <120 seconds
- **Must:** Video shows 3–5 credible sources visibly
- **Must:** Judges understand the innovation (research + video in one pipe)
- **Must:** Zero crashes during live demo

### 2.2 Complexity vs. Impact Trade-off
- **Keep complexity LOW:** Focus on happy path, not edge cases
- **Keep demo HIGH:** Polish the 90-second flow (input → video playback)
- **Ignore:** Real-time updates, user accounts, analytics, advanced styling

---

## 3. CORE FEATURES

### 3.1 Must Have ✅
1. **Landing page with input field**
   - Single text input: "Enter news topic"
   - Submit button labeled "Generate News Video"
   - Input validation: min 3 chars, max 100 chars
   - Clear focus state for mobile/desktop

2. **Gemini API Integration**
   - **Endpoint:** Google Generative AI (Gemini 2.5 Flash or Gemini 2.5 Flash Lite)
   - **Task:** Research + summarize + format as script
   - **Prompt:** (See Section 6: Technical Architecture)
   - **Output:** Structured JSON with {script, sources: [title, url, author]}
   - **Error handling:** Show user-friendly error if Gemini fails

3. **Runway Gen-4.5 Video Generation**
   - **Endpoint:** `/v1/text_to_video` (text-to-video)
   - **Model:** `gen4.5`
   - **Input:** Structured video prompt + prompt_text
   - **Output:** Video URL (stream to frontend)
   - **Duration:** 5 seconds (max quality, fits 50K credits)
   - **Ratio:** `1280:720` (YouTube-ready)
   - **Polling:** Async task — poll every 3 sec until complete

4. **Video Player & Source Display**
   - Video player (HTML5 or Mux.com embed)
   - Sources card below video:
     ```
     SOURCES:
     • [Source 1 Title](url) — Author
     • [Source 2 Title](url) — Author
     • [Source 3 Title](url) — Author
     ```
   - Copy link button (share the generated video)

5. **Loading State**
   - Show spinner + progress text while processing
   - "Researching..." (2–3 sec) → "Generating video..." (10–30 sec)
   - Prevent multiple submissions during processing

### 3.2 Nice to Have (If Time Permits) 🟡
1. Dark mode toggle
2. Video playback stats (generation time, credits used)
3. Save video to browser localStorage (persist last 5 videos)
4. Share to Twitter/LinkedIn with pre-filled caption
5. Input autocomplete (trending topics list from Gemini)

### 3.3 Ignore 🔴
- User authentication (skip Clerk, Supabase Auth)
- Database persistence (use localStorage only)
- Analytics/PostHog
- Advanced video customization (style, voice, music)
- Multi-language support
- Mobile app

---

## 4. USER FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ LANDING PAGE (input.tsx)                                    │
│ - Logo: "📰 Newsreel AI"                                    │
│ - Headline: "Turn News into Cinematic Video"                │
│ - Input field: "What news story matters to you?"            │
│ - Submit button: "Generate Video" (disabled while loading)  │
└─────────────────────────────────────────────────────────────┘
                         ↓ [User types "AI regulation"]
                         ↓ [User clicks "Generate Video"]
┌─────────────────────────────────────────────────────────────┐
│ PROCESSING PAGE (processing.tsx)                            │
│ - Spinner animation                                          │
│ - Step 1: "🔍 Researching news sources..." (2–3 sec)        │
│ - Step 2: "🎬 Generating cinematic video..." (10–30 sec)    │
│ - Cancel button (optional, low priority)                    │
└─────────────────────────────────────────────────────────────┘
                         ↓ [Tasks complete]
┌─────────────────────────────────────────────────────────────┐
│ RESULT PAGE (result.tsx)                                    │
│                                                              │
│ [Video Player - 60 sec cinematic video]                     │
│                                                              │
│ SOURCES:                                                     │
│ ✓ Reuters: AI Bill Passes Senate (reuters.com)              │
│ ✓ BBC: Global AI Regulation Race (bbc.com)                  │
│ ✓ TechCrunch: OpenAI CEO on new rules (techcrunch.com)      │
│                                                              │
│ [Generate Another] [Share] [Download]                       │
│ [← Back to home]                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Frontend Stack
**Framework:** Next.js 14 or any suitable version (App Router)  
**Styling:** Tailwind CSS + shadcn/ui  
**State:** React hooks (useState, useReducer) + localStorage  
**Video Player:** HTML5 <video> tag  

**Structure:**
```
app/
├── page.tsx                  # Landing (input form)
├── components/
│   ├── InputForm.tsx         # Topic input + submit
│   ├── LoadingState.tsx      # Spinner + step text
│   ├── VideoPlayer.tsx       # <video> element
│   ├── SourcesCard.tsx       # Sources list
│   └── ResultPage.tsx        # Video + sources layout
├── api/
│   ├── generate/route.ts     # POST: orchestrate Gemini + Runway
│   └── health/route.ts       # GET: health check
└── lib/
    ├── gemini.ts             # Gemini API wrapper
    ├── runway.ts             # Runway API wrapper
    └── types.ts              # TypeScript interfaces
```

### 5.2 Backend Stack
**Runtime:** Next.js API Routes (Node.js 18+)  
**Environment:** Vercel (free tier)  

**API Routes:**
1. `POST /api/generate` — Main orchestrator
   - Input: { topic: string }
   - Process:
     a) Call Gemini → get script + sources
     b) Call Runway → get video task ID
     c) Poll Runway every 3 sec until complete
     d) Return { videoUrl, sources, generationTime }
   - Timeout: 120 sec (hard limit for UX)

2. `GET /api/health` — Liveness check

**Error Handling:**
- Gemini API down: Return error message "Unable to research topic, try again"
- Runway API down: Return error message "Video generation unavailable, try again"
- Timeout: Return error message "Generation took too long, try simpler topic"

### 5.3 AI API Integration

#### Gemini API (Research + Script Generation)
**Model:** `gemini-2.5-flash` (or `gemini-2.5-flash-lite` as fallback)  
**Endpoint:** Google Generative AI SDK (`@google/generative-ai`)  
**Cost:** ~0.1 credits per request  

**Prompt Structure:**
```
Role: You are a news journalist creating a 60-second video script.

Input: "${topic}"

Task:
1. Research credible recent news about: "${topic}"
2. Write a 60-second script (300–350 words) with strong opening/closing
3. Return ONLY valid JSON (no markdown, no extra text):

{
  "script": "String of 300-350 words, journalistic tone",
  "title": "One-line headline for video",
  "sources": [
    { "title": "Source 1", "url": "https://...", "author": "News org" },
    { "title": "Source 2", "url": "https://...", "author": "News org" },
    { "title": "Source 3", "url": "https://...", "author": "News org" }
  ]
}

Important:
- Script must be engaging, visual, cinematic
- Include specific dates/numbers where possible
- No speculation or opinions
- Include call-to-action at end (e.g., "Learn more on [source]")
```

**Response Parsing:**
- Extract JSON from response
- Validate: script.length > 100, sources.length >= 2
- If invalid, retry once with simplified prompt

#### Runway API (Video Generation)
**Model:** `gen4.5` (latest, most powerful)  
**Endpoint:** `POST /v1/text_to_video`  
**Documentation:** https://docs.dev.runwayml.com/api#tag/Start-generating/paths/~1v1~1text_to_video/post

**Request Body:**
```javascript
{
  "model": "gen4.5",
  "prompt_text": ${geminiScript},     // Full script from Gemini
  "ratio": "1280:720",                // YouTube aspect ratio
  "duration": 5,                       // 5 seconds (within free tier)
  "watermark": false                   // No Runway watermark
}
```

**Response:**
```javascript
{
  "id": "task_...",                   // Task ID for polling
  "status": "QUEUED"
}
```

**Polling Logic:**
- Poll `GET /v1/tasks/{id}` every 3 seconds
- Stop when status = "SUCCEEDED" or "FAILED"
- Max retries: 40 (120 sec total)

**Output:**
```javascript
{
  "id": "task_...",
  "status": "SUCCEEDED",
  "output": [
    "https://cdn.runwayml.com/tasks/video_...mp4"
  ]
}
```

### 5.4 Database
**Storage:** None persistent (MVP scope)  
**Session State:** React component state + localStorage
- Store last 5 generated videos in localStorage:
  ```javascript
  localStorage.setItem('newsreel_history', JSON.stringify([
    { topic, videoUrl, sources, timestamp }
  ]))
  ```

### 5.5 Hosting
**Platform:** Vercel (free tier)  
- Deploy from GitHub
- Auto-redeploy on push to main
- Environment variables: `GEMINI_API_KEY`, `RUNWAY_API_KEY`

**Domain:** Provide a short link in demo (e.g., newsreel-ai.vercel.app)

---

## 6. DEMO SCENARIO (90 seconds)

### 6.1 Demo Script for Judges
**Time: 0:00–0:15** — Setup
- "Hi, I'm building Newsreel AI — a tool that turns any news topic into a cinematic video with sources cited."
- Show landing page on screen

**Time: 0:15–0:25** — Input
- Say: "Let me generate a video about AI regulation."
- Type: "AI regulation" in the input field
- Click: "Generate Video"
- UI shows: "🔍 Researching..." spinner

**Time: 0:25–0:55** — Processing
- Wait for Gemini + Runway to complete (30 sec max)
- UI shows: "🎬 Generating cinematic video..."
- Narrate during wait: "Behind the scenes, Gemini is researching credible sources, writing a journalistic script, and Runway is turning that into video."

**Time: 0:55–1:30** — Result
- Video plays (5 seconds)
- Show sources card:
  ```
  SOURCES:
  ✓ Reuters: AI Regulation Bill Advances
  ✓ BBC: Global AI Governance Framework
  ✓ The Verge: OpenAI CEO on Compliance
  ```
- Say: "Notice the sources — every video is fact-checked and attributed. This solves the misinformation problem with AI video."
- Click: "Generate Another" to show it works twice
- Final message: "One API call away from transparent, source-backed news video."

### 6.2 Backup Plan (If API Fails)
- Pre-record a 90-sec video demo on your phone (showing successful run)
- Play pre-record, then attempt live demo
- Judges will understand API complexity and appreciate effort

---

## 7. STACK DECISIONS (FINAL)

### 7.1 Frontend
| Choice | Option | Why |
|--------|--------|-----|
| Framework | **Next.js 14** | Fast setup, built-in API routes, Vercel deploy |
| Styling | **Tailwind + shadcn/ui** | Fast, pre-built components, professional look |
| State | **React hooks** | No Redux needed for this scope |
| Video player | **HTML5 <video>** | Zero dependencies, works everywhere |

### 7.2 Backend
| Choice | Option | Why |
|--------|--------|-----|
| Runtime | **Next.js API Routes** | Collocated with frontend, no separate server |
| Hosting | **Vercel** | Free tier, auto-deploy from GitHub, zero config |
| Auth | **SKIP** | Hackathon demo doesn't need user accounts |
| Database | **SKIP** | Use localStorage only, zero backend DB |

### 7.3 AI APIs
| Component | Choice | Reason |
|-----------|--------|--------|
| Research | **Google Gemini 2.0 Flash** | Fastest, most capable, free tier sufficient |
| Video Gen | **Runway Gen-4.5 via `/v1/text_to_video`** | Latest, text-to-video (not image-to-video), highest quality |
| Speech | **Skip** | Video is visual enough, no narration needed |

### 7.4 Libraries & Dependencies
**Must Install:**
```bash
npm install next react react-dom
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node @types/react typescript
npm install @google/generative-ai
npm install axios                    # For Runway API (or use fetch)
npm install dotenv                   # Env vars
npm install @radix-ui/react-dialog   # For modal (optional)
```

**Avoid:**
- Authentication libraries (Clerk, Auth0, Supabase Auth)
- Database ORMs (Prisma, Drizzle)
- State managers (Redux, Zustand)
- Analytics (PostHog, Segment)

### 7.5 Environment Variables
Create `.env.local`:
```
GEMINI_API_KEY=<your-gemini-key>
RUNWAY_API_KEY=<your-runway-key>
NEXT_PUBLIC_APP_NAME=Newsreel AI
```

---

## 8. IMPLEMENTATION CHECKLIST (48-Hour Timeline)

### Friday Kickoff (2 hours)
- [ ] Sign up for Gemini API + get key
- [ ] Sign up for Runway API + verify 50K credits
- [ ] Clone Next.js starter template
- [ ] Deploy empty app to Vercel
- [ ] Set up environment variables on Vercel

### Friday Evening (4 hours)
- [ ] Build landing page (InputForm + button)
- [ ] Implement Gemini API wrapper (`lib/gemini.ts`)
- [ ] Implement Runway API wrapper (`lib/runway.ts`)
- [ ] Build API route `/api/generate` (orchestrator)
- [ ] Test Gemini + Runway calls independently

### Saturday Morning (4 hours)
- [ ] Build LoadingState component (spinner + steps)
- [ ] Build VideoPlayer + SourcesCard components
- [ ] Integrate frontend ↔ API route
- [ ] Test end-to-end: topic → video
- [ ] Fix bugs from E2E testing

### Saturday Afternoon (4 hours)
- [ ] Polish loading states & error messages
- [ ] Test on mobile (responsive design)
- [ ] Pre-record backup demo video
- [ ] Test API rate limits & timeouts
- [ ] Deploy final version to Vercel

### Saturday Night (2 hours)
- [ ] Final bug fixes
- [ ] Test demo scenario 5 times
- [ ] Prepare 90-sec pitch
- [ ] Get screenshots for submission form

### Sunday (Demo Prep)
- [ ] Final checks
- [ ] Practice demo 10 times
- [ ] Test on judge's potential network (hotspot)
- [ ] Submit final project link to Runway

---

## 9. SUCCESS CRITERIA FOR JUDGES

**Creativity:** ⭐⭐⭐ News + video + sources = novel combo  
**Impact:** ⭐⭐⭐ Solves real problem (misinformation, news fatigue)  
**Polish:** ⭐⭐ MVP quality, no crashes, clean UI  
**Technical Depth:** ⭐⭐⭐ Two API orchestrations, async polling, error handling  

---

## 10. API CALL REFERENCE

### Gemini API Call
```javascript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateNewsScript(topic: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are a news journalist...
    Input: "${topic}"
    ...
    Return ONLY valid JSON: { script, title, sources }
  `;

  const response = await model.generateContent(prompt);
  const text = response.response.text();
  return JSON.parse(text); // { script, sources, title }
}
```

### Runway API Call
```javascript
// lib/runway.ts
export async function generateVideo(script: string) {
  const response = await fetch('https://api.runwayml.com/v1/text_to_video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gen4.5',
      prompt_text: script,
      ratio: '1280:720',
      duration: 5
    })
  });

  const data = await response.json();
  return data.id; // Task ID for polling
}

export async function pollVideoStatus(taskId: string, maxWaitSec = 120) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitSec * 1000) {
    const response = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}` }
    });
    const data = await response.json();

    if (data.status === 'SUCCEEDED') return data.output[0];
    if (data.status === 'FAILED') throw new Error('Video generation failed');

    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 sec
  }
  throw new Error('Video generation timeout');
}
```

### Orchestrator API Route
```javascript
// app/api/generate/route.ts
export async function POST(req: Request) {
  const { topic } = await req.json();

  try {
    // Step 1: Get script from Gemini
    const { script, sources } = await generateNewsScript(topic);

    // Step 2: Start video generation
    const taskId = await generateVideo(script);

    // Step 3: Poll until complete
    const videoUrl = await pollVideoStatus(taskId);

    // Step 4: Return result
    return Response.json({
      videoUrl,
      sources,
      generationTime: Date.now()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 11. RISKS & MITIGATIONS

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Gemini hallucination (bad sources) | High | Test with multiple topics before Saturday; validate sources exist |
| Runway video generation too slow | High | Pre-test with same prompt; have 30-sec timeout buffer in demo |
| API rate limits hit | Medium | Limit to 1 video per topic during demo; document credit usage |
| Video quality looks cheap | Medium | Use descriptive, cinematic prompts; show examples beforehand |
| Mobile responsive breaks | Low | Test on iPhone 12 + Android in dev tools; use Tailwind responsive classes |
| Judges' WiFi unstable | Medium | Pre-record backup demo video; have it ready to play |

---

## 12. SUBMISSION REQUIREMENTS

**By Monday 9 AM ET:**
1. **Live Link:** https://newsreel-ai.vercel.app (or custom domain)
2. **GitHub Repo:** Public repo with README
3. **Demo Video:** 90–120 sec screen recording of working demo
4. **Description:** 200 words explaining the innovation + sources

---

## 13. POST-HACKATHON IMPROVEMENTS (If You Win)

- [ ] Add authentication (Clerk)
- [ ] Store generation history in Supabase
- [ ] Add trending topics widget
- [ ] Support multiple languages
- [ ] Create iOS app with Expo
- [ ] Add analytics (PostHog)
- [ ] Open-source the codebase
- [ ] Submit to ProductHunt

---

**Good luck! Ship it. 🚀**
