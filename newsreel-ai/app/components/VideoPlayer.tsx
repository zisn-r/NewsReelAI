'use client';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  taskId: string;
  initialStatus?: string;
  title?: string;
}

export default function VideoPlayer({ taskId, initialStatus, title }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(initialStatus || 'QUEUED');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId || videoUrl || status === 'FAILED') return;

    let pollInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/video?taskId=${taskId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video status');
        }
        
        const data = await response.json();
        setStatus(data.status);

        if (data.status === 'SUCCEEDED' && data.output?.[0]) {
          setVideoUrl(data.output[0]);
          clearInterval(pollInterval);
        } else if (data.status === 'FAILED') {
          setError(data.error || 'Video generation failed');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling video status:', err);
      }
    };

    pollInterval = setInterval(pollStatus, 3000);
    pollStatus(); // initial check

    return () => clearInterval(pollInterval);
  }, [taskId, videoUrl, status]);

  return (
    <div className="w-full h-full surface-card overflow-hidden flex flex-col border border-[var(--border)] rounded-xl">
      {/* Title bar */}
      {title && (
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface-light)]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] truncate">{title}</h2>
        </div>
      )}

      {/* Video Area */}
      <div className="w-full flex-1 bg-black relative flex items-center justify-center min-h-[240px]">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : error ? (
          <div className="text-[var(--error)] text-center p-4">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-[var(--muted)]">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--muted)] border-t-[var(--accent)] animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">
              {status === 'QUEUED' ? 'Waiting in queue...' : 'Generating video...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
