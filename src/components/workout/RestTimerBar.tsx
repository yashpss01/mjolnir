import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, Plus } from 'lucide-react';

interface RestTimerBarProps {
  secondsRemaining: number;
  exerciseName?: string;
  onTimerTick: (newSeconds: number) => void;
  onAdd30Seconds: () => void;
  onSkip: () => void;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({
  secondsRemaining,
  exerciseName,
  onTimerTick,
  onAdd30Seconds,
  onSkip,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0 || isPaused) return;

    const interval = setInterval(() => {
      onTimerTick(secondsRemaining - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, isPaused, onTimerTick]);

  if (secondsRemaining <= 0) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3">
      <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-700/80 shadow-2xl rounded-2xl p-3 flex items-center justify-between text-zinc-100 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Rest Timer</span>
            <span className="font-mono font-extrabold text-xl text-white tracking-tight leading-none">
              {formattedTime}
            </span>
          </div>
          {exerciseName && (
            <span className="text-xs text-zinc-400 truncate max-w-[110px] hidden sm:inline">
              {exerciseName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onAdd30Seconds}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-semibold rounded-lg text-zinc-200 flex items-center gap-0.5 border border-zinc-700/50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            30s
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 rounded-lg border border-zinc-700/50 transition"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current text-blue-400" /> : <Pause className="w-4 h-4 text-zinc-300" />}
          </button>
          <button
            onClick={onSkip}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-400 hover:text-white rounded-lg border border-zinc-700/50 transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
