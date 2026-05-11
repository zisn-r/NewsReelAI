// lib/types.ts

export interface NewsSource {
  title: string;
  url: string;
  publication: string;
  author?: string;
  date?: string;
  credibility?: 'tier1' | 'tier2';
}

export interface GenerateNewsResponse {
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

export interface TTSResponse {
  audio_url: string;
  tts_task_id: string;
  generated_at: string;
}

export interface RunwayTask {
  id: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  output?: string[];
  error?: string;
}

export interface GenerateResult {
  success: boolean;
  script_readable: string;
  title: string;
  sources: NewsSource[];
  video_task_id: string;
  video_status: string;
  tts_ready: boolean;
  generated_at: number;
}

export interface GenerateError {
  error: string;
  step: 'gemini' | 'runway' | 'polling';
}
