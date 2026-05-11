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

  const isDashboardView = !!result && !isLoading;

  return (
    <div className={`relative w-full overflow-x-hidden flex flex-col ${isDashboardView ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
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

      <main className={`relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center ${isDashboardView ? 'py-6 h-full' : 'py-12'}`}>
        <div className={`w-full flex flex-col items-center ${isDashboardView ? 'gap-6 h-full overflow-hidden' : 'gap-12'}`}>
          {/* ── Header ──────────────────────────────────────── */}
          {!result && (
            <div className="text-center space-y-6 max-w-[65ch] animate-[fadeIn_.5s_ease]">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1]">
                Newsreel AI
              </h1>
              <p className="text-lg md:text-xl text-[var(--muted)] leading-relaxed">
                Turn any news topic into a cinematic, source-cited video in seconds.
              </p>
            </div>
          )}

          {/* ── Main Content Area ───────────────────────────── */}
          <div className={`w-full flex flex-col items-center ${isDashboardView ? 'flex-1 overflow-hidden' : ''}`}>
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
              <div className="w-full h-full flex flex-col gap-6 animate-[fadeIn_.5s_ease] overflow-hidden">
                {/* Header for Results */}
                <div className="flex items-end justify-between border-b border-[var(--border)] pb-4 flex-shrink-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                        Generation Complete
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                      <span className="text-[10px] text-[var(--muted)] uppercase tracking-tight">
                        {result.video_task_id.slice(0, 8)}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-bold truncate leading-tight">{result.title}</h2>
                  </div>
                  <div className="hidden md:block text-right">
                     <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">
                        Newsreel AI Summary
                     </p>
                     <p className="text-[10px] text-[var(--muted)]/50 uppercase tracking-tight mt-1">
                        {new Date().toLocaleDateString()}
                     </p>
                  </div>
                </div>

                {/* Dashboard Columns */}
                <div className="results-dashboard flex-1 overflow-hidden">
                  {/* Left Column: Video + Action */}
                  <div className="dashboard-column dashboard-column-left">
                    <div className="grid-area-video overflow-hidden">
                      <VideoPlayer 
                        taskId={result.video_task_id} 
                        initialStatus={result.video_status} 
                      />
                    </div>

                    {/* Small Button Area */}
                    <div className="grid-area-button flex items-center justify-center surface-card border-dashed border-[var(--border)] bg-[var(--background)]/30 overflow-hidden">
                      <button
                        onClick={() => setResult(null)}
                        className="group flex items-center gap-4 transition-standard px-6 w-full h-full hover:bg-[var(--accent)]/5"
                      >
                        <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-standard flex-shrink-0">
                          <span className="text-lg group-hover:scale-110 transition-standard">+</span>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--foreground)] transition-standard">
                            Create Another Reel
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Content */}
                  <div className="dashboard-column dashboard-column-right">
                    <div className="grid-area-script overflow-hidden">
                      <ScriptCard script={result.script_readable} />
                    </div>

                    <div className="grid-area-sources overflow-hidden">
                      <SourcesCard sources={result.sources} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
