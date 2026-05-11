import { NextRequest, NextResponse } from 'next/server';
import { createRunwayTTSTask, getRunwayTTSStatus } from '@/lib/runway';

export async function POST(request: NextRequest) {
  try {
    const { script_readable, task_id } = await request.json();

    if (!script_readable) {
      return NextResponse.json({ error: 'Missing script_readable' }, { status: 400 });
    }

    console.log(`[TTS] Starting generation for task ${task_id || 'unknown'}`);
    const ttsTaskId = await createRunwayTTSTask(script_readable);
    console.log(`[TTS] Runway TTS task created: ${ttsTaskId}`);

    const startTime = Date.now();
    const maxWait = 120 * 1000; // 2 minutes
    const pollInterval = 2 * 1000; // 2 seconds

    while (Date.now() - startTime < maxWait) {
      const ttsStatus = await getRunwayTTSStatus(ttsTaskId);

      if (ttsStatus.status === 'SUCCEEDED') {
        console.log(`[TTS] Generation complete`);
        return NextResponse.json({
          success: true,
          audio_url: ttsStatus.output?.audio_url || ttsStatus.output?.[0] || ttsStatus.output,
          duration_seconds: Math.round((Date.now() - startTime) / 1000),
          generated_at: new Date().toISOString()
        });
      }

      if (ttsStatus.status === 'FAILED') {
        return NextResponse.json(
          { error: ttsStatus.error || 'TTS generation failed', can_retry: true },
          { status: 500 }
        );
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Audio generation took too long (exceeded 2 minutes)',
        suggestion: 'Try again later or read the text summary instead',
        can_retry: true 
      },
      { status: 408 }
    );

  } catch (error) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', can_retry: true },
      { status: 500 }
    );
  }
}
