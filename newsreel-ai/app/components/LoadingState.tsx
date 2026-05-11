// app/components/LoadingState.tsx
'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { key: 'validate', icon: '🔎', label: 'Validating topic…' },
  { key: 'research', icon: '📰', label: 'Researching sources…' },
  { key: 'script',   icon: '✍️',  label: 'Writing video script…' },
  { key: 'video',    icon: '🎬', label: 'Generating cinematic video…' },
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
    <div className="glass-card max-w-md mx-auto p-8 flex flex-col items-center gap-6
                    animate-[fadeIn_.3s_ease]">
      {/* Spinner */}
      <div className="spinner" />

      {/* Step list */}
      <ul className="w-full space-y-3">
        {STEPS.map((step, i) => {
          const isDone    = i < stepIdx;
          const isCurrent = i === stepIdx;

          return (
            <li
              key={step.key}
              className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                isDone ? 'opacity-40' : isCurrent ? 'opacity-100' : 'opacity-20'
              }`}
            >
              <span className="text-base">{isDone ? '✅' : step.icon}</span>
              <span className={isCurrent ? 'text-[var(--accent-light)] font-medium' : ''}>
                {step.label}
              </span>
              {isCurrent && <span className="pulse-dot ml-auto" />}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[var(--muted)]">This usually takes 15–45 seconds</p>
    </div>
  );
}
