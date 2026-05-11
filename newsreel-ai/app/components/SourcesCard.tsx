// app/components/SourcesCard.tsx
'use client';

import { NewsSource } from '@/lib/types';

interface SourcesCardProps {
  sources: NewsSource[];
}

export default function SourcesCard({ sources }: SourcesCardProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto glass-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full
                        bg-[var(--success)]/15 text-[var(--success)] text-xs font-bold">
          ✓
        </span>
        <h3 className="font-semibold text-base">
          Sources <span className="text-[var(--muted)] font-normal">({sources.length})</span>
        </h3>
      </div>

      {/* Source list */}
      <ul className="space-y-3">
        {sources.map((source, i) => (
          <li
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface)]
                       border border-[var(--border)] hover:border-[var(--accent)]
                       transition-colors group"
          >
            {/* Index badge */}
            <span className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full text-xs font-semibold
                           flex items-center justify-center
                           bg-[var(--accent)]/10 text-[var(--accent-light)]
                           group-hover:bg-[var(--accent)]/20 transition-colors">
              {i + 1}
            </span>

            <div className="min-w-0 flex-1">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--accent-light)] hover:underline
                           line-clamp-2"
              >
                {source.title}
              </a>

              <p className="mt-1 text-xs text-[var(--muted)] truncate">
                {source.publication || source.author}
                {source.publication && source.author && ` · ${source.author}`}
                {source.date && ` · ${source.date}`}
              </p>
            </div>

            {/* Credibility badge */}
            {source.credibility && (
              <span
                className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  source.credibility === 'tier1'
                    ? 'bg-[var(--success)]/10 text-[var(--success)]'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}
              >
                {source.credibility}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
