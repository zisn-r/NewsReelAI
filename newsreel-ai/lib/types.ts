// lib/types.ts

export interface NewsSource {
  title: string;
  url: string;
  publication: string;
  author?: string;
  date?: string;
  credibility?: 'tier1' | 'tier2';
}

export interface GeminiResponse {
  success: boolean;
  script?: string;
  visual_prompt?: string;
  title?: string;
  hook?: string;
  estimated_duration?: number;
  sources: NewsSource[];
  metadata?: {
    topic: string;
    generated_at: string;
    word_count: number;
    source_count: number;
    confidence: number;
  };
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
