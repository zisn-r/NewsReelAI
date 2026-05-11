'use client';

import { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import LoadingState from './components/LoadingState';
import VideoPlayer from './components/VideoPlayer';
import SourcesCard from './components/SourcesCard';
import ScriptCard from './components/ScriptCard';
import { GenerateResult, GenerateError } from '@/lib/types';

interface HistoryItem extends GenerateResult {
  topic: string;
  timestamp: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('newsreel_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

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
        
        if (errorData.step === 'gemini') {
          errorMessage = `We couldn't research that topic. It might be too obscure or we couldn't find credible sources. Please try another topic like "technology news".`;
        } else if (errorData.step === 'runway' || errorData.step === 'polling') {
          errorMessage = `The script was written, but we had trouble generating the video. This is usually temporary. Please try again.`;
        }
        
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as GenerateResult;
      setResult(data);

      // Save to history
      const newItem: HistoryItem = {
        ...data,
        topic,
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('newsreel_history', JSON.stringify(updatedHistory));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden flex flex-col">
      {/* ── Background Marquee (Full Bleed) ──────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none flex items-center justify-center overflow-hidden z-0" aria-hidden="true">
        <div className="flex animate-marquee whitespace-nowrap text-[15vw] font-black uppercase tracking-tighter text-[var(--foreground)]">
          <span className="mr-32">
            REUTERS • AP NEWS • BBC • THE VERGE • BLOOMBERG • NPR • WIRED • CNN • THE GUARDIAN • WSJ • AL JAZEERA • 
          </span>
          <span className="mr-32">
            REUTERS • AP NEWS • BBC • THE VERGE • BLOOMBERG • NPR • WIRED • CNN • THE GUARDIAN • WSJ • AL JAZEERA • 
          </span>
        </div>
      </div>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 py-16 md:py-32 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center gap-16 md:gap-24">
          {/* ── Header ──────────────────────────────────────── */}
          <div className="text-center space-y-6 max-w-[65ch]">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1]">
              Newsreel AI
            </h1>
            <p className="text-lg md:text-xl text-[var(--muted)] leading-relaxed">
              Turn any news topic into a cinematic, source-cited video in seconds.
            </p>
          </div>

          {/* ── Main Content Area ───────────────────────────── */}
          <div className="w-full flex flex-col items-center">
            {/* ── Input Section ───────────────────────────────── */}
            {!result && !isLoading && (
              <div className="w-full animate-[fadeIn_.5s_ease]">
                <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
                
                {/* ── History Section ────────────────────────────── */}
                {history.length > 0 && (
                  <div className="mt-16 w-full max-w-xl mx-auto space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)] pb-2">
                      Recent Reels
                    </h3>
                    <div className="flex flex-col gap-2">
                      {history.map((item) => (
                        <button
                          key={item.timestamp}
                          onClick={() => setResult(item)}
                          className="flex items-center justify-between p-4 surface-card hover:border-[var(--accent)] transition-all group text-left"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate group-hover:text-[var(--accent-light)] transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-[var(--muted)] uppercase tracking-tight mt-1">
                              {item.topic} • {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-[var(--muted)] group-hover:text-[var(--accent-light)] transition-colors">
                            →
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Loading State ───────────────────────────────── */}
            <LoadingState isVisible={isLoading} />

            {/* ── Error State ─────────────────────────────────── */}
            {error && !isLoading && (
              <div className="w-full max-w-xl mx-auto p-6 surface-card border-[var(--error)]/30 bg-[var(--error)]/5 text-center animate-[fadeIn_.3s_ease]">
                <p className="text-[var(--error)] font-medium mb-6">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-5 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-sm font-semibold"
                >
                  Try another topic
                </button>
              </div>
            )}

            {/* ── Results Section ─────────────────────────────── */}
            {result && !isLoading && (
              <div className="w-full flex flex-col gap-12 animate-[fadeIn_.5s_ease]">
                {/* Title */}
                <div className="text-center mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold">{result.title}</h2>
                </div>

                {/* Script and TTS */}
                <div className="w-full">
                  <ScriptCard script={result.script_readable} />
                </div>

                {/* Sources */}
                <div className="w-full">
                  <SourcesCard sources={result.sources} />
                </div>

                {/* Video Player */}
                <div className="w-full border-t border-[var(--border)] pt-12">
                  <VideoPlayer 
                    taskId={result.video_task_id} 
                    initialStatus={result.video_status} 
                  />
                </div>
                
                <div className="text-center pt-8">
                  <button
                    onClick={() => setResult(null)}
                    className="px-8 py-4 rounded-xl font-bold bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent-light)] transition-all uppercase tracking-widest text-xs"
                  >
                    Create another video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
