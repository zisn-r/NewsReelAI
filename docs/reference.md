# ⚡ HACKATHON QUICK REFERENCE — KEEP THIS OPEN

**Hackathon Dates:** May 8–11, 2026  
**Your Timezone:** Malaysia (UTC+8)  
**Key Deadlines:**
- Registration closes: May 7, 5 PM ET (May 8, 5 AM your time)
- Hackathon ends: May 11, 9 AM ET (May 11, 9 PM your time)

---

## 📋 ONE-PAGE PROJECT SUMMARY

**Name:** Newsreel AI  
**Tagline:** Turn any news topic into a cinematic video with credible sources cited  
**Tech Stack:**
```
Frontend: Next.js 14 + React + Tailwind CSS
Backend: Next.js API Routes (Node.js)
AI APIs: Google Gemini 2.5 Flash + Runway Gen-4.5
Hosting: Vercel
Time to MVP: 48 hours
```

**Demo Flow (90 seconds):**
1. User enters "AI regulation" in input field
2. Gemini researches + writes script (3–5 sec)
3. Runway generates video (10–30 sec)
4. Video + sources display (5 sec)
5. Judge sees source attribution

**Success Metric:** Ship working demo before Sunday midnight

---

## 🚀 FRIDAY KICKOFF CHECKLIST (2–3 hours)

### APIs & Keys
```bash
# Step 1: Get Gemini API Key
- Go to https://ai.google.dev
- Click "Get API Key"
- Create/select Google Cloud project
- Copy key → save in safe place

# Step 2: Get Runway API Key
- Go to https://dev.runwayml.com
- Login/signup
- Settings → API Keys → Create
- Copy key → save in safe place

# Step 3: Create environment file
touch .env.local
# Add:
# GEMINI_API_KEY=your_gemini_key_here
# RUNWAY_API_KEY=your_runway_key_here
# NEXT_PUBLIC_APP_NAME=Newsreel AI
```

### Project Setup
```bash
# Create Next.js project
npx create-next-app@latest newsreel-ai \
  --typescript --tailwind --eslint --app --no-src-dir --no-git

cd newsreel-ai

# Install dependencies
npm install @google/generative-ai axios dotenv

# Start dev server
npm run dev
# → http://localhost:3000
```

### Verify APIs Work
```bash
# Test Gemini (in Node.js REPL or separate script)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("YOUR_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const result = await model.generateContent("Say hello");
console.log(result.response.text()); // Should output text

# Test Runway (in terminal with curl)
curl -X GET https://api.runwayml.com/v1/organization \
  -H "Authorization: Bearer YOUR_RUNWAY_KEY"
# Should return 200 + org info
```

### Deploy to Vercel
```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/newsreel-ai
git push -u origin main

# 2. Import to Vercel (UI-based, ~5 min)
# - Go to vercel.com
# - New Project
# - Import from GitHub
# - Select your repo
# - Set env vars (GEMINI_API_KEY, RUNWAY_API_KEY)
# - Click Deploy

# 3. You'll get a live URL (e.g., newsreel-ai.vercel.app)
```

**End of Friday:** ✅ APIs working, empty app deployed to Vercel

---

## 🛠️ SATURDAY IMPLEMENTATION SCHEDULE

### Morning (4–5 hours)
```typescript
// PRIORITY 1: Core API Wrappers
// Files: lib/gemini.ts, lib/runway.ts

// Key functions:
- generateNewsScript(topic) → { script, sources, title }
- createTextToVideoTask(script) → taskId
- getTaskStatus(taskId) → { status, output[] }
- pollForVideoCompletion(taskId) → videoUrl

// Test each function individually before combining
```

### Midday (3–4 hours)
```typescript
// PRIORITY 2: API Route Orchestrator
// File: app/api/generate/route.ts

// Flow:
POST /api/generate
├─ Input: { topic }
├─ Call Gemini
├─ Call Runway
├─ Poll Runway
├─ Return { videoUrl, sources }
└─ Error handling

// Test with curl:
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Bitcoin"}'
```

### Afternoon (3–4 hours)
```typescript
// PRIORITY 3: Frontend Components
// Files: app/page.tsx, app/components/*

// Components:
- InputForm.tsx (topic input + submit button)
- LoadingState.tsx (spinner + "Researching..." text)
- VideoPlayer.tsx (HTML5 <video> tag)
- SourcesCard.tsx (sources list with links)

// Connect them in app/page.tsx
```

### Evening (2–3 hours)
```typescript
// PRIORITY 4: Polish & Testing
// - Fix styling (Tailwind)
// - Test E2E (input → video)
// - Test on mobile
// - Deploy to Vercel
// - Pre-record backup demo
```

---

## 🎯 CRITICAL API REFERENCE

### Gemini API
**Endpoint:** Google Generative AI SDK (not HTTP)  
**Model:** `gemini-2.5-flash`  
**Cost:** Free tier, 50K+ requests  

```javascript
// Initialize
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Call
const response = await model.generateContent(userPrompt);
const text = response.response.text(); // → string

// Response parsing
const json = JSON.parse(text); // Expect { script, sources, title }
```

**Prompt Structure:**
```
Role: You are a news journalist...
Task: Research "${topic}" and create a 60-second video script
Format: Return ONLY valid JSON: { script, title, sources }
Sources: Should include [{ title, url, author }]
```

---

### Runway API
**Base URL:** `https://api.runwayml.com/v1`  
**Auth:** Bearer token in Authorization header  
**Cost:** 50K free credits for hackathon  

#### 1. Create Text-to-Video Task
```bash
POST /v1/text_to_video
Headers:
  Authorization: Bearer YOUR_RUNWAY_API_KEY
  Content-Type: application/json

Body:
{
  "model": "gen4.5",
  "prompt_text": "Your script here (300-350 words)",
  "duration": 5,
  "ratio": "1280:720",
  "watermark": false
}

Response:
{
  "id": "task_abc123...",
  "status": "QUEUED"
}
```

#### 2. Get Task Status (Poll This)
```bash
GET /v1/tasks/{taskId}
Headers:
  Authorization: Bearer YOUR_RUNWAY_API_KEY

Response (QUEUED):
{
  "id": "task_abc123...",
  "status": "QUEUED"
}

Response (IN_PROGRESS):
{
  "id": "task_abc123...",
  "status": "IN_PROGRESS"
}

Response (SUCCEEDED):
{
  "id": "task_abc123...",
  "status": "SUCCEEDED",
  "output": ["https://cdn.runwayml.com/...video.mp4"]
}

Response (FAILED):
{
  "id": "task_abc123...",
  "status": "FAILED",
  "error": "Reason here"
}
```

#### 3. Polling Strategy
```javascript
// Poll every 3 seconds, max 120 seconds
const maxWait = 120 * 1000; // 120 sec in ms
const pollInterval = 3 * 1000; // 3 sec
const startTime = Date.now();

while (Date.now() - startTime < maxWait) {
  const task = await fetch(`/v1/tasks/${taskId}`);
  const status = task.status;
  
  if (status === 'SUCCEEDED') return task.output[0]; // videoUrl
  if (status === 'FAILED') throw new Error(task.error);
  
  await sleep(pollInterval); // Wait 3 sec, then retry
}
throw new Error('Timeout');
```

---

## 🎬 DEMO SCRIPT (90 seconds)

**What to show judges:**

```
[0:00-0:15] INTRO
"Hi, I built Newsreel AI — a tool that turns any news topic 
into a cinematic video with sources cited. This solves the 
misinformation problem with AI video."

[0:15-0:30] INPUT
"Let me generate a video about AI regulation."
[Type "AI regulation" in input field, click Generate]

[0:30-1:00] PROCESSING
UI shows: "🔍 Researching..." → "🎬 Generating..."
[Narrate while waiting]
"Gemini is researching credible sources, writing a script, 
and Runway is turning it into video."

[1:00-1:30] RESULT
[Video plays for 5 seconds]
"Notice the sources at the bottom — every video is 
fact-checked. This is transparent AI, not propaganda."

[1:30-1:45] CLOSING
"One API call away from source-backed news video.
Ready to demo it again?"
[Click Generate Another]
```

**Backup:** If APIs fail during live demo, have a pre-recorded video ready to play

---

## 🐛 COMMON BUGS & FIXES

| Bug | Cause | Fix |
|-----|-------|-----|
| "GEMINI_API_KEY undefined" | Env var not set | Check `.env.local`, restart dev server |
| Runway returns 401 | Invalid API key | Verify key in dev.runwayml.com |
| Video generation timeout | Script too long | Limit to <350 words |
| Gemini returns non-JSON | Model hallucinating | Add "Return ONLY valid JSON" to prompt |
| Video won't load | URL expired | Check Runway task completed successfully |
| Deploy fails | Missing env vars on Vercel | Add GEMINI_API_KEY + RUNWAY_API_KEY in Vercel dashboard |

---

## 📊 CREDIT USAGE (Rough Estimates)

**Gemini API:**
- 1 research call = ~0.1 credits
- 50 generations = ~5 credits used (you have 50,000)

**Runway API:**
- Gen-4.5 text-to-video (5 sec, 1280:720) = ~100 credits
- 50 generations = ~5,000 credits used (you have 50,000)

**Total for 50 videos:** ~5,100 credits (plenty of buffer)

---

## 🚨 DECISION TREE

**If API is too slow:**
- Runway: Shorten script to <200 words
- Runway: Reduce duration to 3 sec (instead of 5)
- Gemini: Use simpler prompt, remove formatting request

**If video quality is poor:**
- Make script more cinematic/visual (use scene descriptions)
- Add more specific details (dates, names, numbers)
- Try different topics

**If Gemini hallucinating sources:**
- Add "Verify all sources are real news outlets" to prompt
- Validate JSON response before passing to Runway
- Add retry logic (ask again if sources invalid)

**If you're running out of time:**
- SKIP: Error handling edge cases
- SKIP: Dark mode, animations
- SKIP: Mobile responsive (do basic Tailwind responsive)
- KEEP: Happy path (input → video)
- KEEP: Source attribution (core differentiator)

---

## 📱 MOBILE TESTING

```bash
# Test on iPhone/Android
# Option 1: Use browser dev tools (F12 → toggle device mode)
# Option 2: Use ngrok to expose localhost
npm install -g ngrok
ngrok http 3000
# Share the URL from ngrok output with phone

# Test checklist:
- [ ] Input field is tappable
- [ ] Submit button works
- [ ] Video player has controls
- [ ] Sources are readable
- [ ] Loading spinner visible
```

---

## 🎁 BONUS: IF YOU FINISH EARLY

1. **Trending topics:** Add a list of trending news topics (hardcoded or from API)
2. **Share buttons:** Add Twitter/LinkedIn share (pre-filled with video link)
3. **Video download:** Allow users to download generated video
4. **Multiple scripts:** Show different script versions before generating video
5. **Custom voice:** Add Text-to-Speech narration (Runway has TTS API)

---

## 📞 GETTING HELP

**If stuck:**
1. Check PRD document (sections 10+)
2. Check Explicit Stack Configuration (code examples)
3. Check Runway docs: https://docs.dev.runwayml.com
4. Check Gemini docs: https://ai.google.dev
5. Ask in Runway Discord: https://discord.gg/runwayml
6. Check your console logs (most helpful!)

**Discord channels to watch:**
- #api-help
- #hackathon-questions
- #feedback

---

## ✅ SUBMISSION CHECKLIST

**By Sunday 11:59 PM ET (Monday 11:59 AM your time):**
- [ ] Live link works: https://newsreel-ai.vercel.app
- [ ] GitHub repo public with README
- [ ] Demo video recorded (90–120 sec)
- [ ] Submitted via https://runwayml.com/api-hackathon
- [ ] 200-word description filled out
- [ ] Screenshots uploaded
- [ ] Team members listed

---

## 🎯 JUDGING CRITERIA

| Criteria | What they're looking for | Your advantage |
|----------|--------------------------|-----------------|
| **Creativity** | Novel use of Runway API | News + video + sources = unique combo |
| **Impact** | Solves real problem | Misinformation + news fatigue solution |
| **Polish** | Works smoothly, no crashes | MVP quality, clean UI, responsive |
| **Technical Depth** | Shows understanding of APIs | Two API orchestrations, async polling |

---

## 🏁 FINAL MINDSET

- **Ship > Perfect** — Working MVP beats polished concept
- **Demo Matters** — 90 seconds of wow > 100 hours of code
- **MVP Scope** — Input → video. That's it. Nothing else.
- **Have Fun** — This is a learning opportunity, not stress test

---

**Good luck! You've got this. 🚀**

Last updated: May 2026
