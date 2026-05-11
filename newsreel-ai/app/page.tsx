'use client';

import { useState } from 'react';
import InputForm from './components/InputForm';
import LoadingState from './components/LoadingState';
import VideoPlayer from './components/VideoPlayer';
import SourcesCard from './components/SourcesCard';
import { GenerateResult, GenerateError } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const handleGenerate = async (topic: string) => {
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
        const errorData = (await response.json()) as GenerateError;
        let errorMessage = errorData.error || 'Failed to generate video.';
        
        // Provide user-friendly messages based on the step that failed
        if (errorData.step === 'gemini') {
          errorMessage = `We couldn't research that topic. It might be too obscure or we couldn't find credible sources. Please try another topic like "technology news".`;
        } else if (errorData.step === 'runway' || errorData.step === 'polling') {
          errorMessage = `The script was written, but we had trouble generating the video. This is usually temporary. Please try again.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as GenerateResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center min-h-screen">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--muted)]">
          Newsreel AI
        </h1>
        <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto">
          Turn any news topic into a cinematic, source-cited video in seconds.
        </p>
      </div>

      {/* ── Input Section ───────────────────────────────── */}
      {!result && !isLoading && (
        <div className="w-full animate-[fadeIn_.5s_ease]">
          <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
        </div>
      )}

      {/* ── Loading State ───────────────────────────────── */}
      <div className="w-full mt-8">
        <LoadingState isVisible={isLoading} />
      </div>

      {/* ── Error State ─────────────────────────────────── */}
      {error && !isLoading && (
        <div className="w-full max-w-xl mx-auto mt-8 p-4 rounded-xl border border-[var(--error)] bg-[var(--error)]/10 text-center animate-[fadeIn_.3s_ease]">
          <p className="text-[var(--error)] font-medium mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors text-sm"
          >
            Try another topic
          </button>
        </div>
      )}

      {/* ── Results Section ─────────────────────────────── */}
      {result && !isLoading && (
        <div className="w-full space-y-8 animate-[fadeIn_.5s_ease] mt-4">
          <VideoPlayer videoUrl={result.videoUrl} title={result.title} />
          <SourcesCard sources={result.sources} />
          
          <div className="text-center pt-8 border-t border-[var(--border)] mt-12">
            <button
              onClick={() => setResult(null)}
              className="px-6 py-3 rounded-xl font-semibold bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent-light)] transition-all"
            >
              Create another video
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
