// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateNewsScript } from '@/lib/gemini';
import { generateVideo } from '@/lib/runway';
import { GenerateResult, GenerateError } from '@/lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { topic } = body;

    // ── Input validation ──────────────────────────────────────────
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Topic must be at least 3 characters', step: 'gemini' } as GenerateError,
        { status: 400 },
      );
    }

    const sanitizedTopic = topic.trim().slice(0, 100);
    console.log('[Generate] Starting for topic:', sanitizedTopic);

    // ── Step 1: Gemini – research + write script ──────────────────
    console.log('[Generate] Step 1 – calling Gemini…');
    const { script, visual_prompt, sources, title } = await generateNewsScript(sanitizedTopic);
    console.log('[Generate] Step 1 done – script generated');

    // ── Step 2: Runway – turn script into video ───────────────────
    console.log('[Generate] Step 2 – calling Runway…');
    const runwayPrompt = visual_prompt || (script ? script.substring(0, 990) : sanitizedTopic);
    const videoUrl = await generateVideo(runwayPrompt);
    console.log('[Generate] Step 2 done – video ready');

    // ── Step 3: Return combined result ────────────────────────────
    const result: GenerateResult = {
      videoUrl,
      sources,
      title,
      generationTime: Date.now() - startTime,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Generate] Error:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error';

    // Try to figure out which step failed for the frontend
    let step: GenerateError['step'] = 'gemini';
    if (message.toLowerCase().includes('runway')) step = 'runway';
    if (message.toLowerCase().includes('poll') || message.toLowerCase().includes('timeout'))
      step = 'polling';

    const errorResponse: GenerateError = { error: message, step };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
