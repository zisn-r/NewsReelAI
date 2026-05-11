// app/components/LoadingState.tsx
'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { key: 'validate', label: 'Validating topic…' },
  { key: 'research', label: 'Researching sources…' },
  { key: 'script',   label: 'Writing video script…' },
  { key: 'video',    label: 'Generating cinematic video…' },
] as const;

interface LoadingStateProps {
  isVisible: boolean;
}

export default function LoadingState({ isVisible }: LoadingStateProps) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setStepIdx(0);
      return;
    }

    // Advance through steps on a timer to give the user a sense of progress
    const timers = [
      setTimeout(() => setStepIdx(1), 1500),
      setTimeout(() => setStepIdx(2), 4000),
      setTimeout(() => setStepIdx(3), 7000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="surface-card max-w-md mx-auto p-8 flex flex-col items-center gap-6 animate-[fadeIn_.3s_ease]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Step list */}
      <ul className="w-full space-y-4">
        {STEPS.map((step, i) => {
          const isDone    = i < stepIdx;
          const isCurrent = i === stepIdx;

          return (
            <li
              key={step.key}
              className={`flex items-center gap-4 text-sm transition-opacity duration-300 ${
                isDone ? 'opacity-40' : isCurrent ? 'opacity-100' : 'opacity-20'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <span className="text-[var(--success)] font-bold" aria-label="Completed">✓</span>
                ) : isCurrent ? (
                  <div className="spinner !w-4 !h-4 !border-2" aria-label="In progress" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[var(--border)]" aria-label="Pending" />
                )}
              </div>
              <span className={isCurrent ? 'text-[var(--accent-light)] font-medium' : ''}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-4 w-full text-center">
        Expected duration: 15–45 seconds
      </p>
    </div>
  );
}
