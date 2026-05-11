// app/components/VideoPlayer.tsx
'use client';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto glass-card overflow-hidden">
      {/* Title bar */}
      {title && (
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
        </div>
      )}

      {/* Video */}
      <video
        id="video-player"
        src={videoUrl}
        controls
        autoPlay
        playsInline
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}
