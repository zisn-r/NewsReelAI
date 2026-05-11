// lib/runway.ts
import { RunwayTask } from './types';

const RUNWAY_API_BASE = 'https://api.dev.runwayml.com/v1';
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY!;
const POLLING_INTERVAL_MS = 3000; // 3 seconds
const MAX_WAIT_SECONDS = 300;     // 5 minutes hard cap

/**
 * Kicks off a text-to-video generation task using Runway Gen-4.5.
 * Returns the task ID used for polling.
 */
export async function createTextToVideoTask(
  scriptText: string,
): Promise<string> {
  const response = await fetch(`${RUNWAY_API_BASE}/text_to_video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RUNWAY_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify({
      model: 'gen4.5',
      promptText: scriptText,
      duration: 10,
      ratio: '1280:720',
      watermark: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Runway API error (${response.status}): ${errorBody}`,
    );
  }

  const data = await response.json();
  return data.id; // task ID
}

/**
 * Fetches the current status of a Runway generation task.
 */
export async function getTaskStatus(taskId: string): Promise<RunwayTask> {
  const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${RUNWAY_API_KEY}`,
      'X-Runway-Version': '2024-11-06',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get task status: ${response.statusText}`,
    );
  }

  return (await response.json()) as RunwayTask;
}

/**
 * Polls a Runway task every 3 s until it succeeds, fails, or times out.
 * Returns the video URL on success.
 */
export async function pollForVideoCompletion(
  taskId: string,
): Promise<string> {
  const startTime = Date.now();

  while (true) {
    const elapsedSec = (Date.now() - startTime) / 1000;

    if (elapsedSec > MAX_WAIT_SECONDS) {
      throw new Error(
        `Video generation timed out after ${MAX_WAIT_SECONDS}s`,
      );
    }

    const task = await getTaskStatus(taskId);

    if (task.status === 'SUCCEEDED' && task.output?.[0]) {
      return task.output[0]; // video URL
    }

    if (task.status === 'FAILED') {
      throw new Error(
        `Video generation failed: ${task.error || 'Unknown error'}`,
      );
    }

    // Still QUEUED or IN_PROGRESS — wait then retry
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
  }
}

/**
 * High-level helper: create task → poll → return video URL.
 */
export async function generateVideo(scriptText: string): Promise<string> {
  const taskId = await createTextToVideoTask(scriptText);
  console.log('[Runway] Task created:', taskId);

  const videoUrl = await pollForVideoCompletion(taskId);
  console.log('[Runway] Video ready:', videoUrl);

  return videoUrl;
}

/**
 * Kicks off a text-to-speech task using Runway Gen-4.5.
 * Returns the TTS task ID.
 */
export async function createRunwayTTSTask(text: string): Promise<string> {
  const response = await fetch(`${RUNWAY_API_BASE}/text_to_speech`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RUNWAY_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify({
      model: 'gen4.5',
      text,
      voice: 'default',
      output_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Runway TTS API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.id; // tts_task_id
}

/**
 * Fetches the current status of a Runway TTS task.
 * Note: RunwayTask can handle TTS since output structure is similar or we can use any.
 * Wait, TTS task output is { audio_url: string } instead of string[]. Let's just return any.
 */
export async function getRunwayTTSStatus(taskId: string): Promise<any> {
  const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${RUNWAY_API_KEY}`,
      'X-Runway-Version': '2024-11-06',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get TTS task status: ${response.statusText}`);
  }

  return await response.json();
}
