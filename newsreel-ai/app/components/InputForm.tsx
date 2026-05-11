// app/components/InputForm.tsx
'use client';

import { useState } from 'react';

interface InputFormProps {
  onSubmit: (topic: string) => Promise<void>;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim().length >= 3) {
      await onSubmit(topic.trim());
    }
  };

  const suggestions = [
    'AI regulation',
    'Climate change',
    'Space exploration',
    'Cryptocurrency',
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
      {/* ── Input field ─────────────────────────────────── */}
      <div className="glass-card glow-ring p-1 transition-all duration-300">
        <input
          id="topic-input"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What news story interests you?"
          maxLength={100}
          disabled={isLoading}
          className="w-full bg-transparent px-5 py-4 text-lg text-[var(--foreground)]
                     placeholder-[var(--muted)] outline-none disabled:opacity-40"
        />
      </div>

      {/* ── Quick-pick suggestions ─────────────────────── */}
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={isLoading}
            onClick={() => setTopic(s)}
            className="px-3 py-1.5 text-xs rounded-full border border-[var(--border)]
                       text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-light)]
                       transition-colors disabled:opacity-30"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Submit button ──────────────────────────────── */}
      <button
        id="submit-btn"
        type="submit"
        disabled={isLoading || topic.trim().length < 3}
        className="w-full py-4 rounded-xl font-semibold text-white text-lg
                   bg-[var(--accent)] hover:bg-[var(--accent-light)]
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200 active:scale-[0.98]
                   shadow-[0_0_24px_rgba(99,102,241,0.3)]"
      >
        {isLoading ? 'Generating…' : '🎬  Generate News Video'}
      </button>
    </form>
  );
}
