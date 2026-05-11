// app/components/InputForm.tsx
'use client';

import { useState, useEffect } from 'react';

interface InputFormProps {
  onSubmit: (topic: string) => Promise<void>;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (topic.trim().length >= 3 && !isLoading) {
      await onSubmit(topic.trim());
    }
  };

  // Keyboard shortcut: CMD/CTRL + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topic, isLoading]);

  const suggestions = [
    'AI regulation',
    'Climate change',
    'Space exploration',
    'Cryptocurrency',
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
      {/* ── Input field ─────────────────────────────────── */}
      <div className="surface-card p-1 transition-standard focus-surgical">
        <label htmlFor="topic-input" className="sr-only">News Topic</label>
        <input
          id="topic-input"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What news story interests you?"
          maxLength={100}
          disabled={isLoading}
          aria-label="Enter news topic"
          className="w-full bg-transparent px-5 py-4 text-lg text-[var(--foreground)]
                     placeholder-[var(--muted)] outline-none disabled:opacity-40"
        />
      </div>

      {/* ── Quick-pick suggestions ─────────────────────── */}
      <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Topic suggestions">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={isLoading}
            onClick={() => setTopic(s)}
            aria-label={`Select suggestion: ${s}`}
            className="px-3 py-1.5 text-xs rounded-full border border-[var(--border)]
                       text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-light)]
                       transition-standard disabled:opacity-30 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Submit button ──────────────────────────────── */}
      <div className="space-y-2">
        <button
          id="submit-btn"
          type="submit"
          disabled={isLoading || topic.trim().length < 3}
          aria-busy={isLoading}
          className="w-full py-4 rounded-xl font-bold text-white text-lg
                     bg-[var(--accent)] hover:bg-[var(--accent-light)]
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-standard active:scale-[0.98]
                     border border-[var(--border)] uppercase tracking-widest"
        >
          {isLoading ? 'Generating…' : 'Generate News Video'}
        </button>
        <p className="text-[10px] text-center text-[var(--muted)] uppercase tracking-tighter">
          Press <kbd className="font-sans px-1 border border-[var(--border)] rounded">⌘</kbd> + <kbd className="font-sans px-1 border border-[var(--border)] rounded">Enter</kbd> to generate
        </p>
      </div>
    </form>
  );
}
