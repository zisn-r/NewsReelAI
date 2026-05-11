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
    <div className="w-full max-w-2xl mx-auto surface-card overflow-hidden">
      {/* Title bar */}
      {title && (
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
        </div>
      )}

      {/* Video Area */}
      <div className="w-full aspect-video bg-black relative flex items-center justify-center">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : error ? (
          <div className="text-[var(--error)] text-center p-4">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-[var(--muted)]">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--muted)] border-t-[var(--accent)] animate-spin" />
            <p className="text-sm font-medium tracking-wide">
              {status === 'QUEUED' ? 'Waiting in queue...' : 'Generating video (~4 mins)...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
