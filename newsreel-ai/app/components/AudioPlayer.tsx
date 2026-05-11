'use client';

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  return (
    <div className="w-full mt-4 bg-[var(--surface-light)] rounded-lg p-3 border border-[var(--border)] animate-[fadeIn_0.5s_ease]">
      <audio
        controls
        autoPlay
        src={audioUrl}
        className="w-full h-10 custom-audio-player"
      />
    </div>
  );
}
