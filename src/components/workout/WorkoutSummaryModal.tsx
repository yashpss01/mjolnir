import React from 'react';
import { Trophy, Clock, Dumbbell, Layers, CheckCircle2 } from 'lucide-react';

interface WorkoutSummaryModalProps {
  name: string;
  durationSeconds: number;
  totalExercises: number;
  totalSets: number;
  totalVolumeKg: number;
  prCount: number;
  onFinish: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  name,
  durationSeconds,
  totalExercises,
  totalSets,
  totalVolumeKg,
  prCount,
  onFinish,
}) => {
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full mx-auto flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Workout Complete</span>
          <h2 className="text-2xl font-black text-white mt-1">{name}</h2>
        </div>

        {prCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-center gap-2 text-amber-400 text-xs font-bold">
            <Trophy className="w-4 h-4" />
            <span>{prCount} New Personal Record{prCount > 1 ? 's' : ''} Achieved!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Duration</span>
            <span className="text-lg font-extrabold font-mono text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              {formatTime(durationSeconds)}
            </span>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Total Volume</span>
            <span className="text-lg font-extrabold font-mono text-blue-400">
              {totalVolumeKg.toLocaleString()} kg
            </span>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Exercises</span>
            <span className="text-lg font-extrabold font-mono text-white flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-zinc-400" />
              {totalExercises}
            </span>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Sets Logged</span>
            <span className="text-lg font-extrabold font-mono text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-zinc-400" />
              {totalSets}
            </span>
          </div>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/40 text-base uppercase tracking-wider transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
