# 🛠️ NEWSREEL AI — EXPLICIT STACK & CONFIGURATION

**For:** Antigravity AI Code Editor  
**Mode:** Copy-paste ready, deterministic, modular  
**Goal:** Minimize decisions, maximize execution

---

## 1. PROJECT SETUP COMMANDS

```bash
# 1. Create Next.js project
npx create-next-app@latest newsreel-ai \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --no-git

# 2. Enter project
cd newsreel-ai

# 3. Install AI & HTTP libraries
npm install @google/generative-ai axios dotenv

# 4. Install dev types
npm install -D @types/node @types/react

# 5. Create .env.local (you fill in keys)
cat > .env.local << EOF
GEMINI_API_KEY=your_key_here
RUNWAY_API_KEY=your_key_here
NEXT_PUBLIC_APP_NAME=Newsreel AI
EOF

# 6. Verify setup
npm run dev
# Should start on http://localhost:3000
```

---

## 2. DIRECTORY STRUCTURE

```
newsreel-ai/
├── app/
│   ├── page.tsx                      # Landing page (entry point)
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Tailwind base
│   ├── api/
│   │   └── generate/
│   │       └── route.ts              # POST /api/generate (main orchestrator)
│   └── components/
│       ├── InputForm.tsx
│       ├── LoadingState.tsx
│       ├── VideoPlayer.tsx
│       └── SourcesCard.tsx
├── lib/
│   ├── gemini.ts                     # Gemini API wrapper
│   ├── runway.ts                     # Runway API wrapper
│   └── types.ts                      # TypeScript interfaces
├── .env.local                        # API keys (you create)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

---

## 3. FILE-BY-FILE IMPLEMENTATION

### 3.1 `lib/types.ts` — TypeScript Interfaces

```typescript
// lib/types.ts
export interface NewsSource {
  title: string;
  url: string;
  author: string;
}

export interface GeminiResponse {
  script: string;
  title: string;
  sources: NewsSource[];
}

export interface RunwayTask {
  id: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  output?: string[];
  error?: string;
}

export interface GenerateResult {
  videoUrl: string;
  sources: NewsSource[];
  generationTime: number;
  title: string;
}

export interface GenerateError {
  error: string;
  step: 'gemini' | 'runway' | 'polling';
}
```

---

### 3.2 `lib/gemini.ts` — Gemini API Wrapper

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateNewsScript(topic: string): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemPrompt = `You are a professional news journalist and video script writer.
Your task is to research a news topic and create a compelling 60-second video script with credible sources.`;

  const userPrompt = `
Topic: "${topic}"

Please research this topic and create a professional news video script.

REQUIREMENTS:
1. Script must be 300-350 words, suitable for a 60-second video
2. Use journalistic tone (objective, fact-based)
3. Include specific dates, numbers, and names where relevant
4. Start with a hook, end with a call-to-action
5. Make it visual and cinematic (describe scenes/imagery)
6. Find 2-3 credible news sources (Reuters, BBC, AP, CNN, Bloomberg, TechCrunch, etc.)

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no extra text):
{
  "script": "Full video script here...",
  "title": "One-line headline",
  "sources": [
    { "title": "Source headline", "url": "https://...", "author": "News outlet" },
    { "title": "Source headline", "url": "https://...", "author": "News outlet" },
    { "title": "Source headline", "url": "https://...", "author": "News outlet" }
  ]
}
`;

  try {
    const response = await model.generateContent([
      { role: 'user', parts: [{ text: userPrompt }] }
    ]);

    const responseText = response.response.text();
    
    // Extract JSON from response (handle markdown wrapping)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed: GeminiResponse = JSON.parse(jsonText);

    // Validation
    if (!parsed.script || !parsed.sources || parsed.sources.length < 2) {
      throw new Error('Invalid Gemini response structure');
    }

    return parsed;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

---

### 3.3 `lib/runway.ts` — Runway API Wrapper

```typescript
// lib/runway.ts
import { RunwayTask } from './types';

const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY!;
const POLLING_INTERVAL_MS = 3000;
const MAX_WAIT_SECONDS = 120;

export async function createTextToVideoTask(
  scriptText: string
): Promise<string> {
  const response = await fetch(`${RUNWAY_API_BASE}/text_to_video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gen4.5',
      prompt_text: scriptText,
      duration: 5,
      ratio: '1280:720',
      watermark: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Runway API Error: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  return data.id; // Task ID
}

export async function getTaskStatus(taskId: string): Promise<RunwayTask> {
  const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RUNWAY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get task status: ${response.statusText}`);
  }

  return await response.json();
}

export async function pollForVideoCompletion(taskId: string): Promise<string> {
  const startTime = Date.now();

  while (true) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    if (elapsedSeconds > MAX_WAIT_SECONDS) {
      throw new Error(
        `Video generation timeout after ${MAX_WAIT_SECONDS} seconds`
      );
    }

    const task = await getTaskStatus(taskId);

    if (task.status === 'SUCCEEDED' && task.output?.[0]) {
      return task.output[0]; // Return video URL
    }

    if (task.status === 'FAILED') {
      throw new Error(`Video generation failed: ${task.error || 'Unknown error'}`);
    }

    // Still processing, wait and retry
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
  }
}

export async function generateVideo(scriptText: string): Promise<string> {
  try {
    const taskId = await createTextToVideoTask(scriptText);
    console.log('Video task created:', taskId);

    const videoUrl = await pollForVideoCompletion(taskId);
    console.log('Video ready:', videoUrl);

    return videoUrl;
  } catch (error) {
    console.error('Runway generation error:', error);
    throw error;
  }
}
```

---

### 3.4 `app/api/generate/route.ts` — Main Orchestrator

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateNewsScript } from '@/lib/gemini';
import { generateVideo } from '@/lib/runway';
import { GenerateResult, GenerateError } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    // Validation
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Topic must be at least 3 characters' } as GenerateError,
        { status: 400 }
      );
    }

    const sanitizedTopic = topic.trim().slice(0, 100);
    console.log('Starting generation for topic:', sanitizedTopic);

    // Step 1: Generate script from Gemini
    console.log('Step 1: Calling Gemini...');
    const { script, sources, title } = await generateNewsScript(sanitizedTopic);
    console.log('Step 1 complete: Script generated');

    // Step 2: Generate video from Runway
    console.log('Step 2: Calling Runway...');
    const videoUrl = await generateVideo(script);
    console.log('Step 2 complete: Video generated');

    // Step 3: Return result
    const result: GenerateResult = {
      videoUrl,
      sources,
      title,
      generationTime: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response: GenerateError = {
      error: errorMessage,
      step: 'gemini', // Simplified, in reality detect which step failed
    };

    return NextResponse.json(response, { status: 500 });
  }
}
```

---

### 3.5 `app/components/InputForm.tsx` — User Input

```typescript
// app/components/InputForm.tsx
'use client';

import { useState } from 'react';

interface InputFormProps {
  onSubmit: (topic: string) => Promise<void>;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      await onSubmit(topic);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What news story interests you? (e.g., 'AI regulation')"
          maxLength={100}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Generating...' : 'Generate News Video'}
        </button>
      </div>
    </form>
  );
}
```

---

### 3.6 `app/components/LoadingState.tsx` — Loading UI

```typescript
// app/components/LoadingState.tsx
'use client';

import { useEffect, useState } from 'react';

interface LoadingStateProps {
  isVisible: boolean;
}

export default function LoadingState({ isVisible }: LoadingStateProps) {
  const [step, setStep] = useState<'research' | 'video'>('research');

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => setStep('video'), 3000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      <p className="text-lg text-gray-700">
        {step === 'research' ? '🔍 Researching news sources...' : '🎬 Generating video...'}
      </p>
    </div>
  );
}
```

---

### 3.7 `app/components/VideoPlayer.tsx` — Video Display

```typescript
// app/components/VideoPlayer.tsx
'use client';

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg">
      <video
        src={videoUrl}
        controls
        autoPlay
        className="w-full bg-black"
      />
    </div>
  );
}
```

---

### 3.8 `app/components/SourcesCard.tsx` — Sources Display

```typescript
// app/components/SourcesCard.tsx
'use client';

import { NewsSource } from '@/lib/types';

interface SourcesCardProps {
  sources: NewsSource[];
}

export default function SourcesCard({ sources }: SourcesCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto mt-6">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Sources</h3>
      <ul className="space-y-3">
        {sources.map((source, i) => (
          <li key={i} className="text-sm text-gray-700">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              {source.title}
            </a>
            {source.author && <span className="text-gray-500"> — {source.author}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 3.9 `app/page.tsx` — Main Landing Page

```typescript
// app/page.tsx
'use client';

import { useState } from 'react';
import InputForm from './components/InputForm';
import LoadingState from './components/LoadingState';
import VideoPlayer from './components/VideoPlayer';
import SourcesCard from './components/SourcesCard';
import { GenerateResult } from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📰 Newsreel AI</h1>
          <p className="text-lg text-gray-600">Turn any news topic into a cinematic video</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8 max-w-2xl mx-auto">
            <p className="font-semibold">Error: {error}</p>
            <p className="text-sm mt-1">Please try again with a different topic.</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingState isVisible={isLoading} />}

        {/* Result Display */}
        {result && !isLoading && (
          <div className="space-y-6">
            <VideoPlayer videoUrl={result.videoUrl} />
            <SourcesCard sources={result.sources} />
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}

        {/* Input Form (show when not loading/result) */}
        {!result && !isLoading && (
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </div>
    </main>
  );
}
```

---

## 4. DEPLOYMENT (VERCEL)

### 4.1 Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial Newsreel AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/newsreel-ai.git
git push -u origin main

# 2. Import to Vercel
# Go to vercel.com, click "New Project", select your GitHub repo
# Vercel auto-detects Next.js

# 3. Add environment variables in Vercel dashboard
# Settings → Environment Variables
# GEMINI_API_KEY = (your key)
# RUNWAY_API_KEY = (your key)

# 4. Deploy
# Click "Deploy" — Vercel auto-builds and deploys
```

### 4.2 Custom Domain (Optional)
```
# In Vercel dashboard, go to Settings → Domains
# Add custom domain (e.g., newsreel.yourname.com)
# Follow DNS instructions
```

---

## 5. API KEYS — HOW TO GET THEM

### Gemini API Key
1. Go to https://ai.google.dev
2. Click "Get API Key"
3. Select/create a Google Cloud project
4. Copy the API key
5. Paste in `.env.local`: `GEMINI_API_KEY=xxx`

**Cost:** Free tier covers 50K+ requests

### Runway API Key
1. Go to https://dev.runwayml.com
2. Sign up / Log in
3. Go to Settings → API Keys
4. Create new key (copy immediately, won't show again)
5. Paste in `.env.local`: `RUNWAY_API_KEY=xxx`

**Cost:** You get 50K free credits for hackathon

---

## 6. TESTING CHECKLIST

### Local Testing (Before Deploy)
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test API endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI regulation"}'
# Should return: { videoUrl, sources, title, generationTime }
```

### Production Testing (On Vercel)
1. Go to your Vercel URL
2. Enter "Bitcoin halving"
3. Wait 30–60 sec
4. Should show video + sources
5. Click "Generate Another"
6. Try different topics

### Edge Cases to Test
- **Empty input:** Should show error
- **Too long input (>100 chars):** Should truncate
- **Slow network:** Should show loading spinner for full duration
- **API failure:** Should show user-friendly error message
- **Mobile (iPhone):** Video player responsive?

---

## 7. TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "GEMINI_API_KEY is undefined" | Check `.env.local` exists with correct key |
| Runway API returns 401 | Check API key is valid and has credits |
| Video generation timeout | Simplify prompt; retry with shorter topic |
| Next.js build fails | Run `npm install` again; check Node version (18+) |
| Video won't play | Check browser supports MP4; try different browser |
| Vercel deployment fails | Check all env vars set in Vercel dashboard |

---

## 8. PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| Landing page load | <2 sec |
| Gemini API response | <3 sec |
| Runway video generation | 10–30 sec |
| Total demo flow | <60 sec |
| Video player first frame | <1 sec after API completes |

---

## 9. FINAL CHECKLIST (Before Hackathon)

- [ ] Verify Gemini API key works
- [ ] Verify Runway API key works (test with sample prompt)
- [ ] Local dev works end-to-end
- [ ] Deployed to Vercel
- [ ] Env vars set on Vercel
- [ ] Test live URL in incognito browser
- [ ] Test on mobile (iPhone/Android)
- [ ] Pre-record backup demo video
- [ ] Test demo script timing (90 sec)
- [ ] GitHub repo public with README

---

**Ready to ship? Good luck! 🚀**
