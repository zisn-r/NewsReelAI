// app/components/SourcesCard.tsx
'use client';

import { NewsSource } from '@/lib/types';

interface SourcesCardProps {
  sources: NewsSource[];
}

export default function SourcesCard({ sources }: SourcesCardProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full h-full surface-card flex flex-col border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] p-5 pb-3">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--muted)]">
          Sources <span className="font-normal">({sources.length})</span>
        </h3>
      </div>

      {/* Source list */}
      <div className="flex-1 overflow-y-auto p-4 scroll-custom">
        <ul className="space-y-2">
          {sources.map((source, i) => (
            <li
              key={i}
              className="flex items-start gap-4 p-3 border border-[var(--border)] hover:border-[var(--accent)]
                         transition-colors group bg-[var(--background)]/50"
            >
              {/* Index */}
              <span className="flex-shrink-0 w-4 h-4 mt-0.5 text-xs font-mono
                             flex items-center justify-center text-[var(--muted)]">
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-light)]
                             line-clamp-2 transition-colors"
                >
                  {source.title}
                </a>

                <p className="mt-1 text-[10px] text-[var(--muted)] uppercase tracking-tight truncate">
                  {source.publication || source.author}
                  {source.publication && source.author && ` · ${source.author}`}
                  {source.date && ` · ${source.date}`}
                </p>
              </div>

              {/* Credibility tag */}
              {source.credibility && (
                <span
                  className={`flex-shrink-0 mt-0.5 px-1.5 py-0.5 border text-[9px] font-semibold uppercase tracking-wider ${
                    source.credibility === 'tier1'
                      ? 'border-[var(--success)]/30 text-[var(--success)]'
                      : 'border-yellow-500/30 text-yellow-400'
                  }`}
                >
                  {source.credibility}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
