'use client';

import { useState } from 'react';
import AudioPlayer from './AudioPlayer';

interface ScriptCardProps {
  script: string;
}

export default function ScriptCard({ script }: ScriptCardProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleListen = async () => {
    setIsLoadingTTS(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_readable: script }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      setAudioUrl(data.audio_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error generating audio');
    } finally {
      setIsLoadingTTS(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
  };

  return (
    <div className="w-full h-full surface-card flex flex-col border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] p-5 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">
          Script Summary
        </h3>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors px-2 py-1"
          >
            Copy
          </button>
          {!audioUrl && (
            <button
              onClick={handleListen}
              disabled={isLoadingTTS}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50"
            >
              {isLoadingTTS ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating...
                </>
              ) : (
                <>🔊 Listen</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-custom">
        <div className="prose prose-invert max-w-none">
          <p className="text-[15px] leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
            {script}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-[var(--error)]/10 text-[var(--error)] rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
      </div>
    </div>
  );
}
