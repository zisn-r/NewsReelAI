// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateDualScriptAndSources } from '@/lib/gemini';
import { createTextToVideoTask } from '@/lib/runway';
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

    // ── Step 1: Gemini – research + write dual scripts ──────────────────
    console.log('[Generate] Step 1 – calling Gemini…');
    const scriptData = await generateDualScriptAndSources(sanitizedTopic);
    console.log('[Generate] Step 1 done – scripts generated');

    // ── Step 2: Runway – kick off video generation ───────────────────
    console.log('[Generate] Step 2 – calling Runway…');
    const runwayPrompt = scriptData.script_visual || sanitizedTopic;
    const videoTaskId = await createTextToVideoTask(runwayPrompt);
    console.log('[Generate] Step 2 done – video task created:', videoTaskId);

    // ── Step 3: Return combined result immediately ────────────────────────────
    const result: GenerateResult = {
      success: true,
      script_readable: scriptData.script_readable,
      title: scriptData.title,
      sources: scriptData.sources,
      video_task_id: videoTaskId,
      video_status: 'generating',
      tts_ready: false,
      generated_at: Date.now()
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
